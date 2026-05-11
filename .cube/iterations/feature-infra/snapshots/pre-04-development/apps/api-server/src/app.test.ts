import { describe, it, expect, vi, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

// Mock @prisma/client because prisma generate cannot run without models (Iteration 0 has no models)
vi.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined);
    $disconnect = vi.fn().mockResolvedValue(undefined);
  },
}));

import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

describe('AppModule - Structured Logging (Task-09)', () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    await moduleRef?.close();
    moduleRef = undefined;
  });

  it('registers pino Logger via LoggerModule in AppModule', async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ onModuleInit: vi.fn().mockResolvedValue(undefined) })
      .compile();

    // FAILS (Red phase): Logger not registered — LoggerModule is not imported in AppModule
    const logger = moduleRef.get(Logger, { strict: false });
    expect(logger).toBeDefined();
  });

  it.todo('Logger uses pino JSON format with timestamp, level, module, message fields');
  it.todo('LOG_LEVEL is read from ConfigService (not hardcoded)');
});
