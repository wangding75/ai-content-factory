import { afterEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

vi.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined);
    $disconnect = vi.fn().mockResolvedValue(undefined);
  },
}));

import { AppModule } from './app.module';
import { ContentProjectsController } from './content-projects/content-projects.controller';
import { ContentTypesController } from './content-types/content-types.controller';
import { HealthController } from './health/health.controller';
import { LlmProvidersController } from './llm-providers/llm-providers.controller';
import { PrismaService } from './prisma/prisma.service';
import { PromptTemplatesController } from './prompt-templates/prompt-templates.controller';

describe('AppModule integration (Task-09)', () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    await moduleRef?.close();
    moduleRef = undefined;
  });

  async function compileAppModule(): Promise<TestingModule> {
    return Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ onModuleInit: vi.fn().mockResolvedValue(undefined) })
      .compile();
  }

  it('keeps the health controller available when business modules are mounted', async () => {
    moduleRef = await compileAppModule();

    expect(moduleRef.get(HealthController, { strict: false })).toBeDefined();
  });

  it('registers structured logging through LoggerModule', async () => {
    moduleRef = await compileAppModule();

    const logger = moduleRef.get(Logger, { strict: false });
    expect(logger).toBeDefined();
  });

  it('loads all content project entry API modules', async () => {
    moduleRef = await compileAppModule();

    expect(moduleRef.get(ContentTypesController, { strict: false })).toBeDefined();
    expect(moduleRef.get(ContentProjectsController, { strict: false })).toBeDefined();
    expect(moduleRef.get(PromptTemplatesController, { strict: false })).toBeDefined();
    expect(moduleRef.get(LlmProvidersController, { strict: false })).toBeDefined();
  });
});
