import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Log slow queries
    this.$on('query' as never, (e: any) => {
      if (e.duration > 1000) {
        this.logger.warn(
          `🐌 Slow query detected: ${e.duration}ms - ${e.query}`,
        );
      }
    });

    // Log database errors
    this.$on('error' as never, (e: any) => {
      this.logger.error('Database Error:', e);
    });

    // Log warnings
    this.$on('warn' as never, (e: any) => {
      this.logger.warn('Database Warning:', e);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connection established successfully');

      // Test database connection
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Database connectivity test passed');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Database connection closed');
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚨 Cannot clean database in production environment');
      return;
    }

    this.logger.log('🧹 Cleaning database...');
    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }

  async getHealth(): Promise<{ status: string; database: string }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected' };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return { status: 'unhealthy', database: 'disconnected' };
    }
  }
}
