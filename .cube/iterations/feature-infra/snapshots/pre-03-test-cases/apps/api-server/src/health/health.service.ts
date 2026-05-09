import { Injectable } from '@nestjs/common';
import { HealthStatusDto } from './dto/health-status.dto';

@Injectable()
export class HealthService {
  getStatus(): HealthStatusDto {
    throw new Error('not implemented');
  }
}
