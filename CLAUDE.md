# CLAUDE.md - HardwareHouse API Development Guide

This file contains development patterns, code style guidelines, and functionality overview for Claude Code when working with the HardwareHouse Admin API project.

## 🏗️ Project Architecture

### Framework & Structure
- **Next.js 16** with App Router architecture (16.4.3 installed, `^16.4.3` in `package.json`) — React 19.2.3
- **TypeScript** for type safety across all files
- **MongoDB** with Prisma ORM 6.19 (default client, imported from `@prisma/client` through `lib/db.ts`)
- **Clerk Authentication** for admin-only access

This app is the admin backend of `hardwarehouse.fr`. The public storefront is a **separate Symfony repository** (`hardwarehouse-sf`) that consumes `/api/v1` read endpoints over HTTP. Any change to a response shape under `app/api/v1/` is a public contract change for that storefront.

Production runs on the OVH VPS: CircleCI builds the `standalone` output on `main` and `deploy/receive-release.sh` swaps it in under PM2 (single instance, behind Nginx and Cloudflare). Runtime variables live in `~/hardwarehouse-api/shared/.env.local` on the server — see `deploy/README.md`.

### Directory Structure
```
app/
├── (admin)/           # Admin dashboard pages (protected)
│   ├── admin/         # Admin management pages
│   └── layout.tsx     # Admin layout with auth protection
├── (site)/            # Public-facing pages (sign-in only: accounts are created by an administrator)
├── api/v1/            # REST API endpoints
└── globals.css        # Global styles

proxy.ts               # Clerk middleware (Next.js 16 renamed middleware.ts -> proxy.ts)

components/
├── admin/             # Admin-specific components
└── ui/                # Reusable UI components (Radix UI + shadcn/ui)

lib/
├── api/               # parseFilters / parsePagination / buildMeta, error classes, handleApiError, internal-request
├── auth/              # roles (employee, admin), requireStaff / requireAdmin, requireShop
├── discounts/         # Discount computation and relation refresh
├── validators/        # Zod schemas, one per entity
├── db.ts              # Prisma client singleton
├── rate-limit.ts      # In-memory rate limiter (rateLimiter) and its key (clientIp)
└── utils.ts           # Utility functions

services/              # Business logic services (one per entity)
hooks/                 # React hooks
types/                 # Shared types (incl. Clerk session claims)
scripts/               # sync-discounts.ts (not scheduled in production: it re-enables discounts disabled by hand)
deploy/                # VPS release script, its tests and the deployment runbook
prisma/
├── schema.prisma      # generator + datasource only
├── models/*.prisma    # One file per model (split schema)
└── seed.js            # Seed script
__tests__/             # Jest unit tests (Zod validators, shop token guard, rate limiter, internal requests)
cypress/               # E2E tests
```

## 📋 Core Functionality

### Entity Management
The system manages these core entities (Prisma models in `prisma/models/`):
- **Products** - Hardware inventory items
- **Categories** - Product categorization
- **Brands** - Product manufacturers
- **Stocks** - Inventory levels
- **Transactions** - Stock movements
- **PurchaseOrder** - Procurement (supplier restocking), **not** customer orders — customer orders live in the Symfony app's PostgreSQL database
- **Discounts** - Promotions applied to products/categories
- **Attributes / CategoryAttributes / ProductAttributeValues** - Typed product specs per category

**Users are not a Prisma model.** Admin users live in Clerk and are read through `clerkClient()`; `db.purchaseOrder`/`db.transactions` reference them by `userId` string only.

### API Patterns
API routes follow these conventions:
- **Authorization** via `requireStaff()` (roles `employee` and `admin`: catalogue, discounts, stocks, uploads, analytics) and `requireAdmin()` (plus users, stock movements, purchase orders) from `lib/auth/require-role.ts`. A signed-in account without a role gets 403. `__tests__/unit/auth/routeGuards.test.ts` holds the expected guard of every route handler: update it when adding a route.
- **Validation** via Zod schemas in `lib/validators/`
- **Error handling** via `handleApiError()` — maps `ZodError` to 400, `ApiError` subclasses to their own status, anything else to a generic 500
- **Rate limiting** in memory (`lib/rate-limit.ts`: sliding window, 10 requests/minute per client IP) — applied **per route, opt-in**, currently on 14 admin handlers (writes, image uploads, stats, transactions, category attributes); the public catalogue reads are not limited. It is not global middleware: a new route gets no rate limiting unless it calls `rateLimiter.limit(clientIp(req))` explicitly. `clientIp()` reads `X-Real-IP`, which Nginx sets from `CF-Connecting-IP`; never key on `X-Forwarded-For`, whose start the client chooses. The counters live in the process, so PM2 must run a single instance.
- **Pagination** via `parsePagination()` (default 25, max 50) + `buildMeta()`
- **Internal calls**: `products`, `brands` and `discounts` collection routes skip pagination when `isInternalRequest(req)` recognises `x-internal-request: <INTERNAL_API_SECRET>` (`lib/api/internal-request.ts`). Only the back-office services send it, through `internalRequestHeaders()`, which throws when the secret is missing instead of letting the lists stop at 25. The Symfony storefront never sends it and stays paginated like any client.

## 🎨 Code Style Guidelines

### Component Conventions
```typescript
// Page Components (Server Components by default)
export const metadata: Metadata = {
    title: "HardWareHouse - Admin - [Entity]",
    description: "Manage [entity] in HardWareHouse admin panel",
    robots: { index: false, follow: false }
}

const EntityPage = () => {
    return (
        <div className="py-5">
            <Suspense fallback={<EntityTableSkeleton />}>
                <EntityTable />
            </Suspense>
        </div>
    );
}
```

### API Route Conventions
```typescript
import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {clientIp, rateLimiter} from "@/lib/rate-limit";
import {requireAdmin} from "@/lib/auth/require-role";
import {buildMeta, parsePagination} from "@/lib/api/filters";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";
import {entityCreateSchema} from "@/lib/validators/entitySchema";

export async function GET(req: NextRequest) {
    try {
        // Rate limiting (opt-in, per route)
        const { success } = await rateLimiter.limit(clientIp(req));
        if (!success) return new NextResponse('Too Many Requests', { status: 429 });

        const pagination = parsePagination(req.nextUrl.searchParams);

        const [items, total] = await Promise.all([
            db.entity.findMany({ skip: pagination.skip, take: pagination.limit }),
            db.entity.count()
        ]);

        return NextResponse.json({
            data: items,
            total,
            meta: buildMeta(total, pagination)
        }, { status: 200 });
    } catch (error) {
        return handleApiError("ENTITY GET", error);
    }
}

export async function POST(req: NextRequest) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const body = entityCreateSchema.parse(await req.json());
        const created = await db.entity.create({ data: body });

        return NextResponse.json({ data: created }, { status: 201 });
    } catch (error) {
        return handleApiError("ENTITY POST", error);
    }
}
```

Never protect a route with a bare `auth()` or a session check: Clerk would accept any signed-in account, including one without a role. Use `requireStaff()` or `requireAdmin()`, which also read `publicMetadata.role`.

### Database Patterns
```typescript
// Always use the shared db instance
import { db } from "@/lib/db";

// Include relations when needed — note the exact relation names on Products:
// category (Categories), brand (Brands), stock (Stocks?), discounts (Discounts[]),
// productAttributeValues, Transactions, PurchaseOrder
const products = await db.products.findMany({
    include: {
        category: true,
        brand: true,
        stock: true,
        discounts: true
    },
    orderBy: {
        createdAt: 'desc'
    }
});
```

Prefer `select` over `include` on collection endpoints — the `/api/v1/products` route does this to keep the storefront payload small.

### Utility Functions
- `cn()` - Tailwind class merging utility
- `slugifyName()` - French-localized URL slugification
- `isSafeSlug()` - Validates a slug before it is used to build a file path (path traversal guard on upload routes)
- `formatDate()` - Consistent date formatting (dd/MM/yyyy HH:mm:ss)
- `formatPrice()` - `fr-FR` currency formatting (EUR)
- Rate limiting is not in `lib/utils.ts`: `rateLimiter` and `clientIp()` live in `lib/rate-limit.ts`

## 🛠️ Development Commands

### Essential Commands
```bash
# Development
npm run dev              # Start development server

# Database
npm run db:generate      # Generate Prisma client (ALWAYS run after schema changes)
npm run db:push          # Push schema changes to database (MongoDB: no migration files)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database with initial data
npm run db:reset         # Reset database and reseed

# Code Quality
npm run build            # Production build
npm run lint             # ESLint checking

# Testing
npm run test             # Jest unit tests
npm run test:watch       # Jest in watch mode
npm run cypress:open     # E2E testing
```

### Critical Development Notes
1. **Always run `npm run db:generate`** after any Prisma schema change — models live in `prisma/models/*.prisma`, not in `schema.prisma`
2. **MongoDB via Prisma has no migrations** — schema changes are applied with `db:push`, so plan for existing documents yourself
3. **Rate limiting is per route**, not global — add it explicitly on new public endpoints
4. **Admin authentication required** for all admin routes
5. **French localization** used throughout the application
6. **Server components by default** - use 'use client' only when necessary

## 🔒 Authentication & Authorization

### Clerk Integration
- **Staff-only access** - no public user registration (Clerk access mode: Invite-only, no `/sign-up` page)
- **Protected routes** in `(admin)` route group, enforced by `proxy.ts`: a staff role for `/admin`, `admin` for users, transactions and purchase orders
- **API protection** via `requireStaff()` / `requireAdmin()` (`lib/auth/require-role.ts`, roles in `lib/auth/roles.ts`)
- The role is read from `sessionClaims.publicMetadata.role`, which requires the custom session token to be configured in the Clerk Dashboard (Configure > Sessions). Without it the check fails closed for everyone.

### Route Protection Pattern
```typescript
import { requireStaff } from "@/lib/auth/require-role";

// In API routes (requireAdmin() for users, transactions and purchase orders)
const { userId, response } = await requireStaff();
if (response) return response;   // 401 if signed out, 403 without the employee or admin role
```

## 📊 Data Patterns

### Response Format
```typescript
// Collection responses
return NextResponse.json({ data: items, total, meta }, { status: 200 });

// Single-resource responses
return NextResponse.json({ data: item }, { status: 200 });

// Error responses — always produced by handleApiError()
// { error: "Message d'erreur", code: "VALIDATION_ERROR" | "INTERNAL_ERROR" | <ApiError code> }
return handleApiError("ENTITY GET", error);
```

`buildMeta()` returns `{ page, limit, totalPages, hasNext, hasPrev }`.

### Common Includes
```typescript
// Products with relations
include: {
    category: true,
    brand: true,
    stock: true,
    discounts: true
}

// Purchase orders (single product per order line)
include: {
    product: {
        select: { id: true, name: true, slug: true, price: true, thumbnail: true }
    }
}
```

## 🎯 Working with Claude Code

### When making changes:
1. **Check existing patterns** - Follow established conventions
2. **Run `db:generate`** after schema changes
3. **Test API endpoints** via the admin interface
4. **Validate with `npm run build`** before committing
5. **Use TypeScript strictly** - no `any` types
6. **French language** for user-facing content
7. **Consistent error handling** through `handleApiError()`
8. **Watch the storefront contract** - changing an `/api/v1` response shape breaks `hardwarehouse-sf`

### Common tasks:
- **Adding new entities**: Create model in `prisma/models/` → `db:generate` → Zod validator → service → API routes → admin pages
- **API modifications**: Keep the auth, validation and error-handling helpers; add rate limiting on public reads
- **UI changes**: Use existing Radix UI components and Tailwind classes
- **Database queries**: Use Prisma with proper type safety and relations

This codebase prioritizes consistency, type safety, and maintainability. Always follow existing patterns when adding new features.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
