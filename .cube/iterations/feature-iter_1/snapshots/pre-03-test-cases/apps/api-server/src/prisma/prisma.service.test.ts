import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';

// Mock @prisma/client because prisma generate cannot run without models (Iteration 0 has no models)
vi.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined);
    $disconnect = vi.fn().mockResolvedValue(undefined);
  },
}));

import { PrismaService } from './prisma.service';

describe('PrismaService (Task-10)', () => {
  let moduleRef: TestingModule;
  let service: PrismaService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    service = moduleRef.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Lifecycle stubs throw 'not implemented' — ignore close errors to prevent cascade failures
    await moduleRef.close().catch(() => undefined);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('onModuleInit() calls $connect() to establish the database connection', async () => {
    const connectSpy = vi.spyOn(service, '$connect').mockResolvedValue(undefined);

    // FAILS (Red phase): throws 'not implemented' instead of calling $connect
    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledOnce();
  });

  it('onModuleDestroy() calls $disconnect() to release the database connection', async () => {
    const disconnectSpy = vi.spyOn(service, '$disconnect').mockResolvedValue(undefined);

    // FAILS (Red phase): throws 'not implemented' instead of calling $disconnect
    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledOnce();
  });
});
