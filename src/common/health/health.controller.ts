import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('ready')
  async readinessCheck() {
    const health = await this.healthService.checkHealth();
    return { ready: health.status === 'healthy' };
  }

  @Get('live')
  livenessCheck() {
    return { alive: true, timestamp: new Date().toISOString() };
  }
}
