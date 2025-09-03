import { Module, MiddlewareConsumer, NestModule, ValidationPipe } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_PIPE, APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { join } from 'path';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RbacModule } from './common/rbac/rbac.module';
import { HealthModule } from './common/health/health.module';
import { ContactsModule } from './contacts/contacts.module';
import { CompaniesModule } from './companies/companies.module';
import { LeadsModule } from './leads/leads.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { NotesModule } from './notes/notes.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';

// Middleware
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';

// Pipes, Guards, Interceptors, Filters
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }) => ({ req }),
      sortSchema: true,
    }),
    PrismaModule,
    RbacModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    HealthModule,
    ContactsModule,
    CompaniesModule,
    LeadsModule,
    DealsModule,
    ActivitiesModule,
    NotesModule,
    ClientsModule,
    ProjectsModule,
    EmployeesModule,
    AttendanceModule,
    InvoicesModule,
    ReportsModule,
  ],
  providers: [
    AppResolver, 
    AppService,
    // Global validation pipe
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
    // Global response interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // Global performance interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, SecurityMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}