import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    const timestamp = new Date().toISOString();

    try {
      // Check database connection
      const dbHealth = await this.prisma.getHealth();

      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const memoryInMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      };

      return {
        status: 'healthy',
        timestamp,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: dbHealth,
        memory: memoryInMB,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp,
        error: error.message,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      };
    }
  }
}
