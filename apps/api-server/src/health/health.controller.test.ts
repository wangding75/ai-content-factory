import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('GET /health (Task-11)', () => {
  let moduleRef: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns HTTP 200 with { "status": "ok" }', async () => {
    // FAILS (Red phase): HealthService.getStatus() throws 'not implemented'
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('returns JSON content-type', async () => {
    // FAILS (Red phase): status is 500 (not implemented), so .expect(200) fails first
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/);
  });
});
