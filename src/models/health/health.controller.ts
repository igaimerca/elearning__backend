import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/common/decorators/skipAuth.decorator';
import { PrismaHealthIndicator } from './PrismaHealthIndicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  check() {
    return this.health.check([
      () => this.http.pingCheck('api', 'https://staging.gradearc.com'),
      () => this.db.pingCheck('db'),
    ]);
  }
}
