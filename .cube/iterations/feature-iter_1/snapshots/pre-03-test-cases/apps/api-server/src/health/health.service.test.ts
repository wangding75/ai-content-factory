import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService (Task-11)', () => {
  let moduleRef: TestingModule;
  let service: HealthService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();
    service = moduleRef.get<HealthService>(HealthService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('getStatus() returns { status: "ok" }', () => {
    // FAILS (Red phase): throws 'not implemented'
    const result = service.getStatus();
    expect(result.status).toBe('ok');
  });
});
