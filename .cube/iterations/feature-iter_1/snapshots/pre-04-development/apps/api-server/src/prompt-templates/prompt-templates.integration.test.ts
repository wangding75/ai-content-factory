import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { JoiValidationPipe } from '../common/joi-validation.pipe';
import { ContentTypesService } from '../content-types/content-types.service';
import { createPromptTemplateSchema } from './prompt-templates.validation';
import { PromptTemplatesService } from './prompt-templates.service';

function createService(prisma: unknown, contentTypesService: ContentTypesService): PromptTemplatesService {
  return Reflect.construct(PromptTemplatesService, [contentTypesService, prisma]) as PromptTemplatesService;
}

const enabledContentType = { id: 'novel', name: 'Novel', packId: 'novel-pack', enabled: true };
const promptTemplateRecord = {
  id: 'template_1',
  name: 'Outline prompt',
  contentTypeId: 'novel',
  purpose: 'outline-agent',
  content: 'Generate a structured content outline.',
  version: 'v1',
  createdAt: new Date('2026-05-11T00:00:00.000Z'),
  updatedAt: new Date('2026-05-11T00:00:00.000Z'),
  contentType: enabledContentType,
};

describe('PromptTemplates API integration (Task-07)', () => {
  it('creates a prompt template after validating content type, purpose, content, and version', async () => {
    const contentTypesService = {
      ensureEnabledContentType: vi.fn().mockResolvedValue(enabledContentType),
    } as unknown as ContentTypesService;
    const service = createService(
      { promptTemplate: { create: vi.fn().mockResolvedValue(promptTemplateRecord) } },
      contentTypesService,
    );

    await expect(
      service.createPromptTemplate({
        name: 'Outline prompt',
        contentTypeId: 'novel',
        purpose: 'outline-agent',
        content: 'Generate a structured content outline.',
        version: 'v1',
      }),
    ).resolves.toMatchObject({
      name: 'Outline prompt',
      contentType: { id: 'novel', name: 'Novel' },
      purpose: 'outline-agent',
      version: 'v1',
      content: 'Generate a structured content outline.',
    });
  });

  it('rejects missing template content with VALIDATION_ERROR', () => {
    const pipe = new JoiValidationPipe(createPromptTemplateSchema);
    let caughtError: unknown;
    try {
      pipe.transform({ name: 'Outline prompt', contentTypeId: 'novel', purpose: 'outline-agent', content: '', version: 'v1' });
    } catch (e) { caughtError = e; }
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).getResponse()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('lists prompt template summaries with contentPreview no longer than 120 characters', async () => {
    const service = createService(
      { promptTemplate: { findMany: vi.fn().mockResolvedValue([promptTemplateRecord]) } },
      {} as ContentTypesService,
    );

    await expect(service.listPromptTemplates()).resolves.toEqual([
      expect.objectContaining({
        name: 'Outline prompt',
        contentType: enabledContentType,
        purpose: 'outline-agent',
        version: 'v1',
        contentPreview: expect.any(String),
        createdAt: '2026-05-11T00:00:00.000Z',
        updatedAt: '2026-05-11T00:00:00.000Z',
      }),
    ]);
  });

  it('returns full prompt template content on detail lookup', async () => {
    const service = createService(
      { promptTemplate: { findUnique: vi.fn().mockResolvedValue(promptTemplateRecord) } },
      {} as ContentTypesService,
    );

    await expect(service.getPromptTemplate('template_1')).resolves.toMatchObject({
      id: 'template_1',
      content: 'Generate a structured content outline.',
    });
  });

  it('truncates contentPreview to no more than 120 characters', async () => {
    const longContent = 'A'.repeat(200);
    const longRecord = { ...promptTemplateRecord, content: longContent };
    const service = createService(
      { promptTemplate: { findMany: vi.fn().mockResolvedValue([longRecord]) } },
      {} as ContentTypesService,
    );

    const result = await service.listPromptTemplates();
    expect(result[0].contentPreview.length).toBeLessThanOrEqual(120);
  });

  it.each([
    ['list', { promptTemplate: { findMany: vi.fn().mockRejectedValue(new Error('db down')) } }, 'PROMPT_TEMPLATES_LOAD_FAILED'],
    ['detail-not-found', { promptTemplate: { findUnique: vi.fn().mockResolvedValue(null) } }, 'PROMPT_TEMPLATE_NOT_FOUND'],
    ['detail-load-failed', { promptTemplate: { findUnique: vi.fn().mockRejectedValue(new Error('db down')) } }, 'PROMPT_TEMPLATE_LOAD_FAILED'],
    ['create-db-failed', { promptTemplate: { create: vi.fn().mockRejectedValue(new Error('db down')) } }, 'PROMPT_TEMPLATE_CREATE_FAILED'],
  ])('maps %s failures to the expected API error code', async (name, prisma, code) => {
    const enabledType = { ensureEnabledContentType: vi.fn().mockResolvedValue(enabledContentType) } as unknown as ContentTypesService;
    const service = name === 'create-db-failed'
      ? createService(prisma, enabledType)
      : createService(prisma, {} as ContentTypesService);
    const action =
      name === 'list'
        ? () => service.listPromptTemplates()
        : name === 'create-db-failed'
          ? () => service.createPromptTemplate({ name: 'Outline prompt', contentTypeId: 'novel', purpose: 'outline-agent', content: 'Generate...', version: 'v1' })
          : () => service.getPromptTemplate('missing');

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
    const service = createService({ promptTemplate: { create: vi.fn() } }, contentTypesService);

    await expect(
      service.createPromptTemplate({
        name: 'Outline prompt',
        contentTypeId: 'missing',
        purpose: 'outline-agent',
        content: 'Generate a structured content outline.',
        version: 'v1',
      }),
    ).rejects.toMatchObject({
      response: { success: false, error: { code: 'CONTENT_TYPE_NOT_AVAILABLE' } },
    });
  });
});
