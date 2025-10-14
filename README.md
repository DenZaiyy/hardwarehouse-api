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
- **Next.js 15.5.2** - React framework with App Router for admin interface and API routes
- **React 19.1.0** - UI library for admin dashboard
- **TypeScript 5** - Type-safe development

### Database & ORM
- **MongoDB** - NoSQL database for inventory data
- **Prisma 6.16.2** - Database ORM and query builder

### Authentication & Authorization
- **Clerk** - Admin-only authentication system
  - `@clerk/nextjs`: ^6.32.0
  - `@clerk/localizations`: ^3.25.1

### Admin UI Components
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible admin interface components
- **Lucide React** - Consistent iconography
- **TanStack Table 8.21.3** - Advanced data table management

### API & Data Management
- **React Hook Form + Zod** - Form handling and validation in admin
- **SWR** - Data fetching and caching

## 📁 Project Structure

```
hardwarehouse-api/
├── app/
│   ├── (admin)/          # Admin dashboard routes (protected)
│   │   ├── brands/       # Brand management pages
│   │   ├── categories/   # Category management pages
│   │   ├── products/     # Product management pages
│   │   └── stocks/       # Stock management pages
│   └── api/              # REST API endpoints for Symfony app
│       ├── brands/       # GET, POST, PUT, DELETE /api/brands
│       ├── categories/   # GET, POST, PUT, DELETE /api/categories
│       ├── products/     # GET, POST, PUT, DELETE /api/products
│       └── stocks/       # GET, POST, PUT, DELETE /api/stocks
├── components/
│   ├── admin/            # Admin dashboard components
│   └── ui/               # Reusable UI components
├── services/             # Business logic for API endpoints
│   ├── brandService.ts
│   ├── categoryService.ts
│   ├── productService.ts
│   └── stockService.ts
├── prisma/               # Database schema and seeds
└── middleware.ts         # Clerk auth middleware
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
GET    /api/brands         # List all brands
POST   /api/brands         # Create new brand
GET    /api/brands/[id]    # Get brand details
PUT    /api/brands/[id]    # Update brand
DELETE /api/brands/[id]    # Delete brand
```

### Categories API
```
GET    /api/categories         # List all categories
POST   /api/categories         # Create new category
GET    /api/categories/[id]    # Get category details
PUT    /api/categories/[id]    # Update category
DELETE /api/categories/[id]    # Delete category
```

### Products API
```
GET    /api/products         # List all products
POST   /api/products         # Create new product
GET    /api/products/[id]    # Get product details
PUT    /api/products/[id]    # Update product
DELETE /api/products/[id]    # Delete product
```

### Stock Management API
```
GET    /api/stocks         # List all stock levels
POST   /api/stocks         # Create new stock entry
GET    /api/stocks/[id]    # Get stock details
PUT    /api/stocks/[id]    # Update stock levels
DELETE /api/stocks/[id]    # Remove stock entry
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
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Update database schema |
| `npm run db:studio` | Open database GUI |
| `npm run db:seed` | Populate test data |
| `npm run db:reset` | Reset database completely |

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
      "brand": "Brand Name",
      "category": "Category Name",
      "price": 99.99,
      "stock": 50,
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
- **Products**: Complete product catalog
- **Stocks**: Inventory levels and tracking

### Relationships
```
Brands (1) ──────────── (N) Products
Categories (1) ──────── (N) Products  
Products (1) ──────────── (1) Stock
```

## 📈 Recent Updates

**Last Updated**: October 2025

Recent improvements:
- Enhanced error handling with toast notifications
- Improved API response formatting
- Fixed redirect timing after operations
- Added comprehensive data validation
- Implemented audit trails for admin actions

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