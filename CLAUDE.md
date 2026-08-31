# CLAUDE.md - HardwareHouse API Development Guide

This file contains development patterns, code style guidelines, and functionality overview for Claude Code when working with the HardwareHouse Admin API project.

## 🏗️ Project Architecture

### Framework & Structure
- **Next.js 15.5.2** with App Router architecture
- **TypeScript** for type safety across all files
- **MongoDB** with Prisma ORM (client generated in `app/generated/prisma/client`)
- **Clerk Authentication** for admin-only access

### Directory Structure
```
app/
├── (admin)/           # Admin dashboard pages (protected)
│   ├── admin/         # Admin management pages
│   └── layout.tsx     # Admin layout with auth protection
├── (site)/            # Public-facing pages (minimal)
├── api/v1/            # REST API endpoints
├── generated/         # Generated Prisma client
└── globals.css        # Global styles

components/
├── admin/             # Admin-specific components
└── ui/                # Reusable UI components (Radix UI + shadcn/ui)

lib/
├── db.ts              # Database connection
├── utils.ts           # Utility functions
└── ...

services/              # Business logic services
prisma/               # Database schema and migrations
```

## 📋 Core Functionality

### Entity Management
The system manages these core entities:
- **Products** - Hardware inventory items
- **Categories** - Product categorization
- **Brands** - Product manufacturers
- **Stocks** - Inventory levels
- **Purchase Orders** - Procurement management
- **Transactions** - Stock movements
- **Users** - Admin user management

### API Patterns
All API routes follow consistent patterns:
- **Rate limiting** via Upstash Redis (10 requests/minute)
- **Authentication** via Clerk for protected endpoints
- **Error handling** with consistent JSON responses
- **CRUD operations** with proper HTTP status codes

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
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimiter } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const { success, remaining } = await rateLimiter.limit(ip);
        
        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes", data: null },
                { status: 429 }
            );
        }

        // Business logic here
        const data = await db.entity.findMany();
        
        const res = NextResponse.json(data, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        return res;
        
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur", data: null },
            { status: 500 }
        );
    }
}
```

### Database Patterns
```typescript
// Always use the shared db instance
import { db } from "@/lib/db";

// Include relations when needed
const products = await db.products.findMany({
    include: {
        category: true,
        discount: true
    },
    orderBy: {
        createdAt: 'desc'
    }
});
```

### Utility Functions
- `cn()` - Tailwind class merging utility
- `slugifyName()` - French-localized URL slugification
- `formatDate()` - Consistent date formatting (dd/MM/yyyy HH:mm:ss)
- `rateLimiter` - Upstash-based rate limiting

## 🛠️ Development Commands

### Essential Commands
```bash
# Development
npm run dev              # Start development server

# Database
npm run db:generate      # Generate Prisma client (ALWAYS run after schema changes)
npm run db:push          # Push schema changes to database
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
1. **Always run `npm run db:generate`** after any Prisma schema changes
2. **Rate limiting is enabled** on all API routes (10 req/min per IP)
3. **Admin authentication required** for all admin routes
4. **French localization** used throughout the application
5. **Server components by default** - use 'use client' only when necessary

## 🔒 Authentication & Authorization

### Clerk Integration
- **Admin-only access** - no public user registration
- **Protected routes** in `(admin)` route group
- **API protection** via `auth()` from `@clerk/nextjs/server`

### Route Protection Pattern
```typescript
import { auth } from "@clerk/nextjs/server";

// In API routes
const { userId } = await auth();
if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}
```

## 📊 Data Patterns

### Response Format
```typescript
// Success responses
return NextResponse.json(data, { status: 200 });

// Error responses
return NextResponse.json(
    { error: "Message d'erreur", data: null },
    { status: 400 }
);
```

### Common Includes
```typescript
// Products with relations
include: {
    category: true,
    discount: true,
    stocks: true
}

// Orders with relations
include: {
    products: {
        include: {
            product: true
        }
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
7. **Consistent error handling** with proper status codes

### Common tasks:
- **Adding new entities**: Create model in schema → generate → create API routes → create admin pages
- **API modifications**: Always maintain rate limiting and auth patterns
- **UI changes**: Use existing Radix UI components and Tailwind classes
- **Database queries**: Use Prisma with proper type safety and relations

This codebase prioritizes consistency, type safety, and maintainability. Always follow existing patterns when adding new features.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
