# CRM Backend API

A comprehensive Customer Relationship Management (CRM) backend built with NestJS, GraphQL, Prisma, and PostgreSQL. Features enterprise-grade RBAC (Role-Based Access Control), authentication, and industry best practices.

## 🚀 Features

- **🔐 Advanced Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Dynamic RBAC with resource-based permissions  
  - Role hierarchy and conditional permissions
  - Permission caching for optimal performance

- **🎯 GraphQL API**
  - Type-safe GraphQL schema
  - Query complexity analysis
  - Playground for development
  - Real-time subscriptions ready

- **📊 CRM Entities**
  - Users, Roles, and Permissions management
  - Contacts and Companies
  - Leads and Deals pipeline
  - Activities and Notes tracking

- **🛡️ Security & Performance**
  - Security headers with Helmet
  - Rate limiting and throttling
  - Input validation and sanitization
  - Performance monitoring and logging
  - Health check endpoints

- **🏗️ Enterprise Architecture**
  - Clean architecture patterns
  - Dependency injection
  - Global error handling
  - Request/Response interceptors
  - Audit logging

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | ^11.0.1 | Node.js framework |
| **GraphQL** | ^16.11.0 | API query language |
| **Prisma** | ^5.20.0 | Database ORM |
| **PostgreSQL** | Latest | Primary database |
| **TypeScript** | ^5.7.3 | Type safety |
| **Jest** | ^30.0.0 | Testing framework |

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

## 📚 GraphQL Schema

### Sample Queries

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

# List users (with RBAC)
query Users {
  users {
    id
    firstName
    lastName
    email
    isActive
    role {
      name
    }
  }
}

# Create user (admin only)
mutation CreateUser {
  createUser(createUserInput: {
    firstName: "John"
    lastName: "Doe"
    email: "john@example.com"
    password: "password123"
    roleId: "role-id-here"
  }) {
    id
    email
  }
}
```

## 🔒 RBAC System

### Role Hierarchy
1. **Super Admin** - Full system access
2. **Admin** - Manage users, roles, and permissions
3. **Manager** - Manage CRM data (leads, deals, contacts)
4. **User** - Basic read access

### Permission Structure
- **Resource**: `user`, `role`, `permission`, `contact`, `company`, `lead`, `deal`
- **Action**: `create`, `read`, `update`, `delete`, `manage`, `assign`
- **Conditions**: `own`, `team`, `department` (conditional access)

### Permission Examples
```typescript
// Check if user can create contacts
await rbacService.hasPermission(userId, {
  resource: ResourceType.CONTACT,
  action: ActionType.CREATE
});

// Check if user can read own contacts only
await rbacService.hasPermission(userId, {
  resource: ResourceType.CONTACT,
  action: ActionType.READ,
  conditions: [{ field: 'createdById', operator: 'own', value: userId }]
});
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with authentication
- `roles` - User roles definition
- `permissions` - System permissions
- `role_permissions` - Role-permission mapping

### CRM Tables  
- `contacts` - Individual contacts
- `companies` - Company/organization records
- `leads` - Sales leads
- `deals` - Sales opportunities
- `activities` - Tasks, calls, meetings
- `notes` - Text notes on any entity

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
FRONTEND_URL=https://your-frontend-domain.com
```

## 📊 Monitoring & Logging

### Health Checks
- Database connectivity
- Memory usage
- Application uptime
- Service readiness

### Performance Monitoring
- Slow query detection (>1s)
- Request duration tracking
- Memory usage alerts
- Error rate monitoring

### Security Features
- Request ID tracking
- Rate limiting (100 req/min)
- Security headers (Helmet)
- Input validation & sanitization
- SQL injection protection

## 🔧 Development

### Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── roles/          # Role management  
├── permissions/    # Permission management
├── common/         # Shared components
│   ├── decorators/ # Custom decorators
│   ├── filters/    # Exception filters
│   ├── guards/     # Auth guards
│   ├── interceptors/ # Request/response interceptors
│   ├── middleware/ # Custom middleware
│   ├── pipes/      # Validation pipes
│   └── rbac/       # RBAC service
├── health/         # Health check endpoints
└── main.ts         # Application bootstrap
```

### Code Style

```bash
# Format code
yarn format

# Lint code
yarn lint

# Fix lint issues
yarn lint --fix
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

## 🔄 Database Migrations

```bash
# Create migration
yarn prisma migrate dev --name migration-name

# Deploy migrations
yarn prisma migrate deploy

# Reset database (dev only)
yarn prisma migrate reset
```

## 📈 Performance Tips

1. **Database Optimization**
   - Use database indices on frequently queried fields
   - Implement connection pooling
   - Monitor slow queries

2. **Caching Strategy**
   - RBAC permission caching (5min TTL)
   - User session caching
   - Query result caching

3. **Security Best Practices**
   - Regular security audits
   - Dependency vulnerability scanning
   - Rate limiting per IP/user
   - Input validation at all levels

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

## 📄 License

This project is [MIT licensed](LICENSE).

## 👥 Support

- Create an [issue](../../issues) for bug reports
- Star ⭐ this repo if you find it helpful
- Follow the project for updates

---

**Built with ❤️ using NestJS, GraphQL, and TypeScript**
