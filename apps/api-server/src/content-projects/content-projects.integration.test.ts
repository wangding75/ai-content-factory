import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { JoiValidationPipe } from '../common/joi-validation.pipe';
import { ContentTypesService } from '../content-types/content-types.service';
import { createContentProjectSchema, updateContentProjectSchema } from './content-projects.validation';
import { ContentProjectsService } from './content-projects.service';

function createService(prisma: unknown, contentTypesService: ContentTypesService): ContentProjectsService {
  return Reflect.construct(ContentProjectsService, [contentTypesService, prisma]) as ContentProjectsService;
}

const enabledContentType = { id: 'novel', name: 'Novel', packId: 'novel-pack', enabled: true };
const projectRecord = {
  id: 'project_1',
  name: 'Evergreen Content Plan',
  contentTypeId: 'novel',
  targetPlatform: 'web',
  targetContentCount: 12,
  defaultGenerationParams: { tone: 'warm' },
  status: 'draft',
  createdAt: new Date('2026-05-11T00:00:00.000Z'),
  updatedAt: new Date('2026-05-11T00:00:00.000Z'),
  contentType: enabledContentType,
};

describe('ContentProjects API integration (Task-06)', () => {
  it('creates a content project after validating the enabled content type', async () => {
    const contentTypesService = {
      ensureEnabledContentType: vi.fn().mockResolvedValue(enabledContentType),
    } as unknown as ContentTypesService;
    const service = createService(
      { contentProject: { create: vi.fn().mockResolvedValue(projectRecord) } },
      contentTypesService,
    );

    await expect(
      service.createContentProject({
        name: 'Evergreen Content Plan',
        contentTypeId: 'novel',
        targetPlatform: 'web',
        targetContentCount: 12,
        defaultGenerationParams: { tone: 'warm' },
      }),
    ).resolves.toMatchObject({
      name: 'Evergreen Content Plan',
      contentType: { id: 'novel', name: 'Novel' },
      targetPlatform: 'web',
      targetContentCount: 12,
      status: 'draft',
      defaultGenerationParams: { tone: 'warm' },
    });
  });

  it('rejects empty project names with VALIDATION_ERROR', () => {
    const pipe = new JoiValidationPipe(createContentProjectSchema);
    let caughtError: unknown;
    try {
      pipe.transform({ name: '', contentTypeId: 'novel', targetPlatform: 'web', targetContentCount: 12, defaultGenerationParams: {} });
    } catch (e) { caughtError = e; }
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).getResponse()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('rejects non-positive target content counts with VALIDATION_ERROR', () => {
    const pipe = new JoiValidationPipe(updateContentProjectSchema);
    let caughtError: unknown;
    try {
      pipe.transform({ name: 'Evergreen Content Plan', targetPlatform: 'web', targetContentCount: 0, defaultGenerationParams: {} });
    } catch (e) { caughtError = e; }
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).getResponse()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('lists project summaries with generic content project fields and ISO timestamps', async () => {
    const service = createService(
      { contentProject: { findMany: vi.fn().mockResolvedValue([projectRecord]) } },
      {} as ContentTypesService,
    );

    await expect(service.listContentProjects()).resolves.toEqual([
      expect.objectContaining({
        id: 'project_1',
        name: 'Evergreen Content Plan',
        contentType: enabledContentType,
        targetPlatform: 'web',
        targetContentCount: 12,
        status: 'draft',
        createdAt: '2026-05-11T00:00:00.000Z',
        updatedAt: '2026-05-11T00:00:00.000Z',
      }),
    ]);
  });

  it('returns the latest detail after update', async () => {
    const updatedRecord = {
      ...projectRecord,
      name: 'Updated Content Plan',
      targetPlatform: 'wechat',
      targetContentCount: 24,
      defaultGenerationParams: { style: 'concise' },
    };
    const service = createService(
      { contentProject: { update: vi.fn().mockResolvedValue(updatedRecord) } },
      {} as ContentTypesService,
    );

    await expect(
      service.updateContentProject('project_1', {
        name: 'Updated Content Plan',
        targetPlatform: 'wechat',
        targetContentCount: 24,
        defaultGenerationParams: { style: 'concise' },
      }),
    ).resolves.toMatchObject({
      id: 'project_1',
      name: 'Updated Content Plan',
      targetPlatform: 'wechat',
      targetContentCount: 24,
      defaultGenerationParams: { style: 'concise' },
    });
  });

  it('deletes a content project and returns the delete contract', async () => {
    const service = createService(
      { contentProject: { delete: vi.fn().mockResolvedValue({ id: 'project_1' }) } },
      {} as ContentTypesService,
    );

    await expect(service.deleteContentProject('project_1')).resolves.toEqual({
      id: 'project_1',
      deleted: true,
    });
  });

  it('returns the content project detail DTO including promptTemplates and defaultLlmProvider for an existing project', async () => {
    const projectDetailRecord = { ...projectRecord, promptTemplates: [] };
    const service = createService(
      {
        contentProject: { findUnique: vi.fn().mockResolvedValue(projectDetailRecord) },
        llmProvider: { findUnique: vi.fn().mockResolvedValue(null) },
      },
      {} as ContentTypesService,
    );

    await expect(service.getContentProject('project_1')).resolves.toMatchObject({
      id: 'project_1',
      name: 'Evergreen Content Plan',
      contentType: { id: 'novel', name: 'Novel' },
      defaultGenerationParams: { tone: 'warm' },
      promptTemplates: expect.any(Array),
      defaultLlmProvider: null,
    });
  });

  it('includes safe defaultLlmProvider in detail DTO without exposing the API key', async () => {
    const llmProviderRecord = {
      id: 'default',
      name: 'OpenAI Compatible',
      model: 'claude-sonnet-4-6',
      baseUrl: 'https://llm.example.test/v1',
      encryptedApiKeyValue: 'encrypted:sk-test-1234567890abcd',
      enabled: true,
      createdAt: new Date('2026-05-11T00:00:00.000Z'),
      updatedAt: new Date('2026-05-11T00:00:00.000Z'),
    };
    const projectDetailRecord = { ...projectRecord, promptTemplates: [] };
    const service = createService(
      {
        contentProject: { findUnique: vi.fn().mockResolvedValue(projectDetailRecord) },
        llmProvider: { findUnique: vi.fn().mockResolvedValue(llmProviderRecord) },
      },
      {} as ContentTypesService,
    );

    const result = await service.getContentProject('project_1');
    expect(result.defaultLlmProvider).toMatchObject({ id: 'default', apiKeyConfigured: true });
    expect(result.defaultLlmProvider).not.toHaveProperty('encryptedApiKeyValue');
    expect(result.defaultLlmProvider).not.toHaveProperty('apiKey');
  });

  it('rejects empty content type ids with VALIDATION_ERROR', () => {
    const pipe = new JoiValidationPipe(createContentProjectSchema);
    let caughtError: unknown;
    try {
      pipe.transform({ name: 'Evergreen Content Plan', contentTypeId: '', targetPlatform: 'web', targetContentCount: 12, defaultGenerationParams: {} });
    } catch (e) { caughtError = e; }
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).getResponse()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it.each([
    ['get-not-found', { contentProject: { findUnique: vi.fn().mockResolvedValue(null) } }, 'CONTENT_PROJECT_NOT_FOUND'],
    ['get-load-failed', { contentProject: { findUnique: vi.fn().mockRejectedValue(new Error('db down')) } }, 'CONTENT_PROJECT_LOAD_FAILED'],
    ['create-db-failed', { contentProject: { create: vi.fn().mockRejectedValue(new Error('db down')) } }, 'CONTENT_PROJECT_CREATE_FAILED'],
    ['list', { contentProject: { findMany: vi.fn().mockRejectedValue(new Error('db down')) } }, 'CONTENT_PROJECTS_LOAD_FAILED'],
    ['update', { contentProject: { update: vi.fn().mockRejectedValue(new Error('db down')) } }, 'CONTENT_PROJECT_SAVE_FAILED'],
    ['update-not-found', { contentProject: { update: vi.fn().mockRejectedValue(Object.assign(new Error('not found'), { code: 'P2025' })) } }, 'CONTENT_PROJECT_NOT_FOUND'],
    ['delete', { contentProject: { delete: vi.fn().mockRejectedValue(new Error('db down')) } }, 'CONTENT_PROJECT_DELETE_FAILED'],
    ['delete-not-found', { contentProject: { delete: vi.fn().mockRejectedValue(Object.assign(new Error('not found'), { code: 'P2025' })) } }, 'CONTENT_PROJECT_NOT_FOUND'],
  ])('maps %s failures to the expected API error code', async (name, prisma, code) => {
    const enabledType = { ensureEnabledContentType: vi.fn().mockResolvedValue(enabledContentType) } as unknown as ContentTypesService;
    const service = name.startsWith('create')
      ? createService(prisma, enabledType)
      : createService(prisma, {} as ContentTypesService);
    const action =
      name.startsWith('get')
        ? () => service.getContentProject('missing')
        : name.startsWith('create')
          ? () => service.createContentProject({ name: 'Plan', contentTypeId: 'novel', targetPlatform: 'web', targetContentCount: 1, defaultGenerationParams: {} })
          : name === 'list'
            ? () => service.listContentProjects()
            : name.startsWith('update')
              ? () => service.updateContentProject('missing', { name: 'Plan', targetPlatform: 'web', targetContentCount: 1, defaultGenerationParams: {} })
              : () => service.deleteContentProject('missing');

    await expect(action()).rejects.toMatchObject({
      response: { success: false, error: { code } },
    });
  });

  it('maps unavailable content type during create to CONTENT_TYPE_NOT_AVAILABLE', async () => {
    const contentTypesService = {
      ensureEnabledContentType: vi.fn().mockRejectedValue({
        response: { success: false, error: { code: 'CONTENT_TYPE_NOT_AVAILABLE' } },
      }),
    } as unknown as ContentTypesService;
    const service = createService({ contentProject: { create: vi.fn() } }, contentTypesService);

    await expect(
      service.createContentProject({
        name: 'Plan',
        contentTypeId: 'missing',
        targetPlatform: 'web',
        targetContentCount: 1,
        defaultGenerationParams: {},
      }),
    ).rejects.toMatchObject({
      response: { success: false, error: { code: 'CONTENT_TYPE_NOT_AVAILABLE' } },
    });
  });
});
