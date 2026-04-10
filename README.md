[![CircleCI](https://dl.circleci.com/status-badge/img/circleci/VGbp6eJGiqeE2nbyjZyTf6/SJneyybsELCQSCGKiWBwTs/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/circleci/VGbp6eJGiqeE2nbyjZyTf6/SJneyybsELCQSCGKiWBwTs/tree/main)
# HardwareHouse Admin API

A Next.js 15 admin-only application providing API endpoints and management interface for hardware inventory. Designed to serve as the backend for a Symfony frontend application.

## 📋 Project Overview

HardwareHouse Admin API is a comprehensive hardware inventory management system that provides:
- **Admin Dashboard**: Complete inventory management interface for authorized administrators
- **REST API**: Endpoints for external Symfony application integration
- **Authentication**: Clerk-based admin authentication and authorization
- **Database Management**: MongoDB with Prisma ORM for reliable data persistence

This application is **not a public store** - it's an internal management system that serves API data to an external Symfony application.

## 🏗️ System Architecture

```
┌─────────────────────┐    HTTP API     ┌──────────────────────┐
│   Symfony Frontend  │ ◄──────────────► │  HardwareHouse API   │
│   (Public Store)    │    REST Calls   │   (Admin Backend)    │
└─────────────────────┘                 └──────────────────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │     MongoDB          │
                                         │   (Database)         │
                                         └──────────────────────┘
```

## 🚀 Tech Stack

### Core Framework
- **Next.js 16.1.7** - React framework with App Router for admin interface and API routes
- **React 19.2.3** - UI library for admin dashboard
- **TypeScript 5** - Type-safe development

### Database & ORM
- **MongoDB** - NoSQL database for inventory data
- **Prisma 6.19** - Database ORM and query builder

### Authentication & Authorization
- **Clerk** - Admin-only authentication system
  - `@clerk/nextjs`: ^7.0.5
  - `@clerk/localizations`: ^3.34.0

### Admin UI Components
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible admin interface components
- **Lucide React 0.545.0** - Consistent iconography
- **TanStack Table 8.21.3** - Advanced data table management

### API & Data Management
- **React Hook Form 7.64.0 + Zod 4.1.12** - Form handling and validation in admin
- **SWR** - Data fetching and caching

## 📁 Project Structure

```
hardwarehouse-api/
├── app/
│   ├── (admin)/                    # Admin dashboard routes (protected)
│   │   ├── admin/
│   │   │   ├── brands/            # Brand management pages
│   │   │   ├── categories/        # Category management pages  
│   │   │   ├── products/          # Product management pages
│   │   │   ├── discounts/         # Discount management system
│   │   │   ├── stocks/            # Stock management pages
│   │   │   ├── purchase-orders/   # Purchase order management
│   │   │   ├── transactions/      # Transaction tracking
│   │   │   └── users/             # User management
│   │   └── (site)/                # Public auth pages
│   └── api/v1/                    # Versioned REST API endpoints
│       ├── brands/                # Brand API routes
│       ├── categories/            # Category API routes
│       ├── products/              # Product API routes
│       ├── discounts/             # Discount API routes
│       ├── stocks/                # Stock API routes
│       ├── transactions/          # Transaction API routes
│       ├── users/                 # User API routes
│       ├── upload/                # File upload endpoints
│       └── stats/                 # Analytics endpoints
├── components/
│   ├── admin/                     # Admin dashboard components
│   │   ├── discounts/            # Discount management components
│   │   └── ...                   # Other admin components
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── api/                      # API utilities & error handling
│   ├── discounts/                # Discount business logic
│   ├── validators/               # Zod schema validators
│   └── ...                      # Other utilities
├── services/                     # Service layer for API calls
│   ├── discount.service.ts       # Discount service
│   └── ...                      # Other services
├── scripts/                      # Background scripts
│   └── sync-discounts.ts        # Discount sync cron job
├── prisma/                      # Database schema and seeds
├── ecosystem.config.js          # PM2 configuration for cron jobs
└── middleware.ts               # Clerk auth middleware
```

## 🔐 Admin Access Control

### Authentication Flow
1. **Admin Login**: Only authorized users (configured in Clerk) can access the system
2. **Protected Routes**: All admin routes require authentication
3. **API Access**: External API calls from Symfony app (may require API key authentication)

### Admin Permissions
- Create, read, update, delete brands
- Manage product categories and hierarchies
- Full product catalog management
- Real-time stock level management
- View analytics and reports

## 🌐 API Endpoints for Symfony Integration

### Brands API
```
GET    /api/v1/brands           # List all brands
POST   /api/v1/brands           # Create new brand  
GET    /api/v1/brands/[slug]    # Get brand details
PATCH  /api/v1/brands/[slug]    # Update brand
DELETE /api/v1/brands/[slug]    # Delete brand
GET    /api/v1/brands/[slug]/products  # Get brand products
```

### Categories API
```
GET    /api/v1/categories           # List all categories
POST   /api/v1/categories           # Create new category
GET    /api/v1/categories/[slug]    # Get category details
PATCH  /api/v1/categories/[slug]    # Update category
DELETE /api/v1/categories/[slug]    # Delete category
GET    /api/v1/categories/[slug]/products    # Get category products
GET    /api/v1/categories/[slug]/attributes  # Get category attributes
```

### Products API
```
GET    /api/v1/products         # List all products
POST   /api/v1/products         # Create new product
GET    /api/v1/products/[slug]  # Get product details
PATCH  /api/v1/products/[slug]  # Update product
DELETE /api/v1/products/[slug]  # Delete product
```

### Discounts API
```
GET    /api/v1/discounts                    # List all discounts
POST   /api/v1/discounts                    # Create new discount
GET    /api/v1/discounts/[id]              # Get discount details
PATCH  /api/v1/discounts/[id]              # Update discount
DELETE /api/v1/discounts/[id]              # Delete discount
GET    /api/v1/discounts/product/[slug]    # Get product discounts
GET    /api/v1/discounts/category/[slug]   # Get category discounts
```

### Stock Management API
```
GET    /api/v1/stocks         # List all stock levels
POST   /api/v1/stocks         # Create new stock entry
GET    /api/v1/stocks/[id]    # Get stock details
PATCH  /api/v1/stocks/[id]    # Update stock levels
DELETE /api/v1/stocks/[id]    # Remove stock entry
```

### Transactions API
```
GET    /api/v1/transactions                  # List all transactions
POST   /api/v1/transactions                  # Create new transaction
GET    /api/v1/transactions/[id]            # Get transaction details
DELETE /api/v1/transactions/[id]            # Delete transaction
GET    /api/v1/transactions/product/[slug]  # Get product transactions
```

### Users API
```
GET    /api/v1/users                    # List all users
POST   /api/v1/users                    # Create new user
GET    /api/v1/users/[id]              # Get user details
PATCH  /api/v1/users/[id]              # Update user
DELETE /api/v1/users/[id]              # Delete user
GET    /api/v1/users/[id]/orders       # Get user orders
GET    /api/v1/users/[id]/transactions # Get user transactions
```

### Analytics API
```
GET    /api/v1/stats/product       # Product statistics
GET    /api/v1/stats/product/[id]  # Specific product stats
GET    /api/v1/stats/stock         # Stock statistics
```

### Upload API
```
POST   /api/v1/upload/brands/[slug]         # Upload brand images
POST   /api/v1/upload/categories/[slug]     # Upload category images
POST   /api/v1/upload/products/[slug]       # Upload product images
GET    /api/v1/upload/products/[slug]/[filename]  # Get product image
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 20+
- MongoDB instance
- Clerk account with admin users configured

### 1. Clone and Install
```bash
git clone <repository-url>
cd hardwarehouse-api
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

Configure these variables:
```env
NODE_ENV="development"
DATABASE_URL="mongodb+srv://user:pass@host/dbname"

# Clerk Admin Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# API Configuration for Symfony integration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_KEY=your_secure_api_key_for_symfony
```

### 3. Database Setup
```bash
npm run db:generate    # Generate Prisma client
npm run db:push       # Create database schema
npm run db:seed       # Populate with initial data
```

### 4. Configure Clerk Admin Users
1. Go to your Clerk dashboard
2. Add authorized admin email addresses
3. Configure authentication settings
4. Set up admin role permissions

### 5. Start the Application
```bash
npm run dev
```

- **Admin Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Base URL**: [http://localhost:3000/api](http://localhost:3000/api)

## 📜 Development Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Code quality checks |
| `npm run test` | Run unit tests |
| `npm run cypress:open` | Open E2E testing |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Update database schema |
| `npm run db:studio` | Open database GUI |
| `npm run db:seed` | Populate test data |
| `npm run db:reset` | Reset database completely |

## 🔄 Background Processing

### Discount Sync Service
The application includes an automated background service that manages discount lifecycle:

#### PM2 Configuration
```bash
# Start both the main app and cron job
pm2 start ecosystem.config.js

# Monitor processes
pm2 status
pm2 logs
```

#### What the Discount Sync Does
- **Automatic Activation**: Activates discounts when their start date is reached
- **Automatic Expiration**: Deactivates discounts when their end date passes
- **Price Recalculation**: Updates product prices in real-time
- **Error Handling**: Robust error handling with logging
- **Performance**: Parallel processing for bulk operations

#### Manual Sync (Development)
```bash
# Run sync script manually
npx tsx scripts/sync-discounts.ts
```

#### Logs
- **Error logs**: `./logs/cron-error.log`
- **Output logs**: `./logs/cron-out.log`
- **Sync frequency**: Every 1 minute (configurable)

## 🐳 Production Deployment

### Quick Start with Docker
```bash
# Build and run the application
docker compose up --build
```

The application will be available at **http://localhost:3333**

### Docker Deployment Options

**Option 1: Docker Compose (Recommended)**
```bash
docker compose up --build
```

**Option 2: Manual Docker Build**
```bash
# Build the image
docker build -t hardwarehouse-admin .

# Run the container
docker run -p 3333:3333 hardwarehouse-admin
```

**Option 3: Multi-platform Build (for cloud deployment)**
```bash
# Build for different CPU architecture (e.g., Mac M1 to amd64 cloud)
docker build --platform=linux/amd64 -t hardwarehouse-admin .

# Push to registry
docker push myregistry.com/hardwarehouse-admin
```

### Environment Variables for Production
```env
NODE_ENV="production"
DATABASE_URL="your_production_mongodb_url"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="prod_clerk_key"
CLERK_SECRET_KEY="prod_clerk_secret"
API_KEY="secure_production_api_key"
```

> 📋 **For detailed Docker instructions and cloud deployment guide, see [README.Docker.md](README.Docker.md)**

## 🔗 Symfony Integration Guide

### API Authentication
Include the API key in your Symfony HTTP requests:
```php
// In your Symfony service
$response = $this->httpClient->request('GET', 'http://your-admin-api.com/api/products', [
    'headers' => [
        'Authorization' => 'Bearer ' . $this->apiKey,
        'Content-Type' => 'application/json'
    ]
]);
```

### Sample API Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "product_id",
      "name": "Product Name",
      "slug": "product-slug",
      "brand": "Brand Name",
      "category": "Category Name", 
      "price": 99.99,
      "discountedPrice": 79.99,
      "stock": 50,
      "sku": "SKU12345",
      "mpn": "MPN67890", 
      "ean13": "1234567890123",
      "promote": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## 📊 Database Schema

### Core Entities
- **Brands**: Manufacturer information
- **Categories**: Product categorization (hierarchical)
- **Products**: Complete product catalog with SKU/MPN/EAN13
- **Discounts**: Time-based discounts for products/categories
- **Stocks**: Inventory levels and tracking
- **Transactions**: Stock movement history
- **Users**: Customer management
- **Purchase Orders**: Procurement tracking

### Relationships
```
Brands (1) ──────────── (N) Products
Categories (1) ──────── (N) Products  
Products (1) ──────────── (1) Stock
Products (1) ──────────── (N) Discounts
Categories (1) ─────────── (N) Discounts
Products (1) ──────────── (N) Transactions
Users (1) ─────────────── (N) Transactions
```

## 📈 Recent Updates

**Last Updated**: March 2026

### Major Features Added

#### Discount Management System (March 2026)
- **Complete discount infrastructure** with time-based activation/expiration
- **Product & Category discounts** - Apply discounts to individual products or entire categories
- **Automated discount sync** - Background cron job automatically activates/deactivates discounts
- **Real-time price calculation** - Products automatically show discounted prices when applicable
- **Admin interface** - Full CRUD operations with form validation and error handling

#### Enhanced Product Data (March 2026)
- **Product identification codes** - Added SKU, MPN, and EAN13 fields
- **Product promotion flags** - Mark products as promoted for featured display
- **Improved seeding** - Enhanced database seeder with realistic product data

#### Advanced API Features (March 2026)
- **API versioning** - All endpoints now use `/api/v1/` structure
- **Enhanced error handling** - Centralized error handling with proper HTTP status codes
- **File upload system** - Image upload endpoints for brands, categories, and products
- **Analytics endpoints** - Product and stock statistics API
- **User management** - Complete user CRUD with order/transaction tracking

#### Background Processing (March 2026)
- **PM2 ecosystem** - Production-ready process management configuration
- **Automated discount sync** - Cron job runs every minute to sync discount states
- **Logging system** - Proper logging for background processes with rotation

#### Developer Experience Improvements
- **TypeScript strict mode** - Enhanced type safety across the application
- **Zod validation** - Comprehensive input validation for all forms and API endpoints
- **Centralized error handling** - Consistent error responses across all API endpoints
- **Enhanced development scripts** - Improved database management and development workflow

### Breaking Changes
- API endpoints moved from `/api/` to `/api/v1/`
- All PATCH operations now use proper HTTP PATCH instead of PUT
- Enhanced validation requires specific data formats for all inputs

### Bug Fixes & Improvements
- Fixed TypeScript compilation issues in discount form components
- Improved form validation with proper error messages
- Enhanced database seeder with more realistic data
- Fixed redirect timing issues after CRUD operations
- Improved toast notification system

## 🛡️ Security Considerations

- **Admin-Only Access**: No public routes or user registration
- **API Authentication**: Secure API key validation for external calls
- **Data Validation**: Comprehensive input validation using Zod
- **CORS Configuration**: Restricted to authorized domains
- **Environment Variables**: All sensitive data in environment variables

## 🤝 Admin User Management

Admins are managed through Clerk:
1. **Add Admin**: Invite users through Clerk dashboard
2. **Role Assignment**: Configure admin permissions
3. **Access Control**: Middleware handles route protection
4. **Session Management**: Automatic session handling via Clerk

## 📄 License

[MIT License](LICENSE) - Internal use only for HardwareHouse inventory management.

---

**Note**: This application is designed specifically as an admin backend for a Symfony frontend. It does not include public-facing store functionality.