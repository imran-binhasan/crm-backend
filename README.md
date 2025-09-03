# CRM Backend API

A comprehensive Customer Relationship Management (CRM) backend built with NestJS, GraphQL, Prisma, and PostgreSQL. Features enterprise-grade RBAC (Role-Based Access Control), authentication, and industry best practices.

## 🚀 Features

### 🔐 Advanced Authentication & Authorization
- JWT-based authentication with refresh tokens
- Dynamic RBAC with resource-based permissions  
- Role hierarchy and conditional permissions
- Permission caching for optimal performance
- Multi-level permission system (create, read, update, delete, manage, assign)

### 🎯 GraphQL API
- Type-safe GraphQL schema with auto-generation
- Query complexity analysis and rate limiting
- Interactive GraphQL Playground for development
- Real-time subscriptions ready
- Comprehensive error handling and validation

### 📊 Complete CRM Module Suite
- **User Management**: Complete user lifecycle with role-based access
- **Contact Management**: Individual contact records with full CRUD operations
- **Company Management**: Organization records with contact relationships
- **Lead Management**: Sales lead tracking with priority and status management
- **Deal Management**: Sales opportunity pipeline with stage tracking
- **Activity Tracking**: Tasks, calls, meetings, and follow-ups
- **Note System**: Contextual notes on any CRM entity
- **Project Management**: Project tracking with progress monitoring
- **Invoice Management**: Billing and invoice generation
- **Employee Management**: HR functionality with employee records
- **Attendance System**: Employee time tracking with approval workflows
- **Client Management**: Client relationship and portfolio management
- **Reporting & Analytics**: Comprehensive business intelligence reports

### 🛡️ Enterprise Security & Performance
- Security headers with Helmet integration
- Rate limiting and request throttling (100 req/min)
- Input validation and sanitization at all levels
- SQL injection protection via Prisma ORM
- Performance monitoring and structured logging
- Health check endpoints for monitoring
- Request ID tracking for audit trails

### 🏗️ Enterprise Architecture Patterns
- **Clean Architecture**: Domain-driven design principles
- **SOLID Principles**: Single responsibility, dependency injection
- **Repository Pattern**: BaseService abstraction for consistent CRUD operations
- **Mapper Pattern**: Clean data transformation between layers
- **Template Method Pattern**: Standardized service layer operations
- **Strategy Pattern**: Flexible permission and validation strategies
- **Audit Trail**: Complete change tracking with user attribution
- **Soft Delete**: Data preservation with logical deletion

### 📈 Advanced Business Logic
- **Deal Pipeline Management**: Stage-based sales process
- **Lead Scoring**: Priority-based lead qualification
- **Attendance Approval Workflows**: Multi-level approval system
- **Project Progress Tracking**: Real-time project status updates
- **Permission Assignment**: Dynamic role and permission management
- **Multi-tenant Ready**: User-scoped data access patterns

### 🔄 Data Management & Integration
- **Database Migrations**: Prisma-based schema evolution
- **Data Seeding**: Comprehensive initial data setup
- **Bulk Operations**: Efficient batch processing
- **Pagination**: Consistent cursor-based pagination
- **Search & Filtering**: Advanced query capabilities
- **File Upload**: Document and asset management

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | ^11.0.1 | Node.js framework |
| **GraphQL** | ^16.11.0 | API query language |
| **Prisma** | ^6.15.0 | Database ORM |
| **PostgreSQL** | Latest | Primary database |
| **TypeScript** | ^5.7.3 | Type safety |
| **Jest** | ^30.0.0 | Testing framework |
| **Passport JWT** | ^10.0.0 | Authentication |
| **Class Validator** | Latest | Input validation |
| **Bcrypt** | ^5.1.1 | Password hashing |

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Yarn package manager
- Git

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd crm-backend
yarn install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
vim .env
```

Required environment variables:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/crm_db
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### 3. Database Setup

```bash
# Generate Prisma client
yarn prisma:generate

# Push database schema
yarn prisma:push

# Seed initial data (admin user, roles, permissions)
yarn db:seed
```

### 4. Start Development Server

```bash
# Development mode with hot reload
yarn start:dev

# Production mode
yarn start:prod
```

## 📱 API Endpoints

### GraphQL
- **Endpoint**: `http://localhost:3000/graphql`
- **Playground**: `http://localhost:3000/graphql` (dev only)

### REST (Health & Monitoring)
- **Health Check**: `GET /api/health`
- **Readiness**: `GET /api/health/ready`  
- **Liveness**: `GET /api/health/live`

## 🔑 Default Credentials

After running the seed script:

```
Email: admin@example.com
Password: admin123
```

⚠️ **Change these credentials immediately in production!**

## 📚 GraphQL Schema & Operations

### Authentication Operations
```graphql
# User authentication
mutation Login {
  login(loginInput: { email: "admin@example.com", password: "admin123" }) {
    accessToken
    refreshToken
    user {
      id
      email
      firstName
      lastName
      role {
        name
        permissions {
          permission {
            resource
            action
          }
        }
      }
    }
  }
}

# Get current user
query Me {
  me {
    id
    email
    firstName
    lastName
    role {
      name
      permissions {
        permission {
          resource
          action
        }
      }
    }
  }
}
```

### CRM Operations
```graphql
# Create lead
mutation CreateLead {
  createLead(createLeadInput: {
    firstName: "John"
    lastName: "Doe"
    email: "john.doe@example.com"
    phone: "+1234567890"
    status: PROSPECT
    priority: HIGH
    source: "Website"
    companyId: "company-id"
  }) {
    id
    firstName
    lastName
    status
    priority
  }
}

# Update deal stage
mutation UpdateDealStage {
  updateDealStage(
    dealId: "deal-id"
    stage: "NEGOTIATION"
  ) {
    id
    title
    stage
    value
  }
}

# Approve attendance
mutation ApproveAttendance {
  approveAttendance(
    attendanceId: "attendance-id"
    approved: true
    notes: "Approved by manager"
  ) {
    id
    status
    approvalStatus
  }
}
```

## 🔒 RBAC System

### Role Hierarchy
1. **Admin** - Full system access, user management, system configuration
2. **Manager** - CRM data management, team oversight, reporting access
3. **User** - Basic CRM operations, personal data access

### Permission Structure
- **Resources**: `user`, `role`, `permission`, `contact`, `company`, `lead`, `deal`, `activity`, `note`, `project`, `invoice`, `employee`, `attendance`, `client`, `report`
- **Actions**: `create`, `read`, `update`, `delete`, `manage`, `assign`
- **Scope**: User-based access control with ownership validation

### Permission Examples
```typescript
// Check if user can create contacts
await rbacService.hasPermission(userId, {
  resource: ResourceType.CONTACT,
  action: ActionType.CREATE
});

// Check if user can approve attendance
await rbacService.hasPermission(userId, {
  resource: ResourceType.ATTENDANCE,
  action: ActionType.UPDATE
});
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with authentication
- `roles` - User roles definition  
- `permissions` - System permissions
- `role_permissions` - Role-permission mapping

### CRM Tables
- `contacts` - Individual contact records
- `companies` - Company/organization records
- `leads` - Sales leads with qualification
- `deals` - Sales opportunities with pipeline stages
- `activities` - Tasks, calls, meetings, follow-ups
- `notes` - Contextual notes on any entity

### Business Tables
- `projects` - Project management records
- `invoices` - Billing and invoice records
- `employees` - HR employee management
- `attendance` - Time tracking and attendance
- `clients` - Client relationship management
- `reports` - Business intelligence and analytics

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov

# Watch mode
yarn test:watch
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start:prod"]
```

### Environment Variables (Production)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-production-key
JWT_REFRESH_SECRET=your-refresh-secret-production-key
FRONTEND_URL=https://your-frontend-domain.com
```

## 📊 Monitoring & Logging

### Health Checks
- Database connectivity monitoring
- Memory usage tracking
- Application uptime validation
- Service readiness verification

### Performance Monitoring
- Slow query detection (>1s)
- Request duration tracking
- Memory usage alerts
- Error rate monitoring
- GraphQL query complexity analysis

### Security Features
- Request ID tracking for audit trails
- Rate limiting (100 req/min per IP)
- Security headers (Helmet)
- Input validation & sanitization
- SQL injection protection via Prisma
- Password hashing with bcrypt

## 🔧 Development

### Project Structure

```
src/
├── auth/           # Authentication & JWT handling
├── users/          # User management
├── roles/          # Role management  
├── permissions/    # Permission management
├── contacts/       # Contact management
├── companies/      # Company management
├── leads/          # Lead management
├── deals/          # Deal management
├── activities/     # Activity tracking
├── notes/          # Note system
├── projects/       # Project management
├── invoices/       # Invoice management
├── employees/      # Employee management
├── attendance/     # Attendance system
├── clients/        # Client management
├── reports/        # Reporting & analytics
├── upload/         # File upload handling
├── common/         # Shared components
│   ├── decorators/ # Custom decorators
│   ├── dto/        # Base DTOs
│   ├── entities/   # Base entities
│   ├── enums/      # System enums
│   ├── filters/    # Exception filters
│   ├── guards/     # Auth guards
│   ├── interceptors/ # Request/response interceptors
│   ├── middleware/ # Custom middleware
│   ├── pipes/      # Validation pipes
│   ├── services/   # Base services
│   └── rbac/       # RBAC service
├── health/         # Health check endpoints
└── main.ts         # Application bootstrap
```

### Code Style & Quality

```bash
# Format code
yarn format

# Lint code
yarn lint

# Fix lint issues
yarn lint --fix

# Type checking
yarn build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

GraphQL schema is auto-generated and available at:
- Development: `http://localhost:3000/graphql`
- Schema file: `src/schema.gql` (auto-generated)

## 🔄 Database Operations

```bash
# Create migration
yarn prisma migrate dev --name migration-name

# Deploy migrations
yarn prisma migrate deploy

# Reset database (dev only)
yarn prisma migrate reset

# Open Prisma Studio
yarn prisma:studio

# Seed database
yarn db:seed
```

## 📈 Performance Tips

1. **Database Optimization**
   - Use database indices on frequently queried fields
   - Implement connection pooling
   - Monitor slow queries with logging

2. **Caching Strategy**
   - RBAC permission caching (5min TTL)
   - User session caching
   - Query result caching for reports

3. **Security Best Practices**
   - Regular security audits
   - Dependency vulnerability scanning
   - Rate limiting per IP/user
   - Input validation at all API layers

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check DATABASE_URL in .env
   # Ensure PostgreSQL is running
   yarn prisma db push
   ```

2. **Permission Errors**
   ```bash
   # Re-run seed to restore default permissions
   yarn db:seed
   ```

3. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules yarn.lock
   yarn install
   ```

4. **GraphQL Schema Issues**
   ```bash
   # Regenerate schema
   yarn start:dev
   # Schema will auto-regenerate
   ```

## 📄 License

This project is [MIT licensed](LICENSE).

## 👥 Support

- Create an [issue](../../issues) for bug reports
- Star ⭐ this repo if you find it helpful
- Follow the project for updates

---

**Built with ❤️ using NestJS, GraphQL, TypeScript, and Enterprise Architecture Patterns**