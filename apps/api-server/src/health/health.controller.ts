import { Controller, Get, Inject } from '@nestjs/common';
import { HealthStatusDto } from './dto/health-status.dto';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get('/health')
  check(): HealthStatusDto {
    return this.healthService.getStatus();
  }
}
