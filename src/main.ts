import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaService } from './common/prisma/prisma.service';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const prismaService = app.get(PrismaService);

    // Security
    app.use(
      helmet({
        contentSecurityPolicy:
          process.env.NODE_ENV === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    // CORS configuration
    app.enableCors({
      origin:
        process.env.NODE_ENV === 'production'
          ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
          : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip unknown properties
        forbidNonWhitelisted: true, // Throw error on unknown properties
        transform: true, // Auto-transform payloads
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Enable shutdown hooks
    app.enableShutdownHooks();

    // Set global prefix for REST endpoints
    app.setGlobalPrefix('api');

    const port = configService.get<number>('PORT', 3000);
    const environment = configService.get<string>('NODE_ENV', 'development');

    await app.listen(port);

    logger.log(`🚀 Application is running on port ${port}`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
    logger.log(`🏥 Health Check: http://localhost:${port}/api/health`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('🛑 SIGTERM received, shutting down gracefully');
      await prismaService.onModuleDestroy();
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('🛑 SIGINT received, shutting down gracefully');
      await prismaService.onModuleDestroy();
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('💥 Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
