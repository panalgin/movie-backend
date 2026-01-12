import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/presentation/decorators';
import { HealthService, type HealthStatus } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  async check(@Res() res: Response): Promise<Response<HealthStatus>> {
    const health = await this.healthService.check();

    const statusCode =
      health.status === 'ok'
        ? HttpStatus.OK
        : health.status === 'degraded'
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(health);
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe - always returns ok if app is running' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe - checks if app can serve requests' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async ready(@Res() res: Response) {
    const health = await this.healthService.check();
    const isReady = health.status !== 'error';

    return res
      .status(isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json({
        status: isReady ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
      });
  }
}
