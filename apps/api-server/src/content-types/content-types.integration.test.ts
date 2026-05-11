import { describe, expect, it, vi } from 'vitest';
import { ContentTypesController } from './content-types.controller';
import { ContentTypesService } from './content-types.service';

function createService(prisma: unknown): ContentTypesService {
  return Reflect.construct(ContentTypesService, [prisma]) as ContentTypesService;
}

describe('ContentTypes API integration (Task-05)', () => {
  it('returns enabled content types in the unified API response', async () => {
    const service = createService({
      contentType: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'novel', name: 'Novel', packId: 'novel-pack', enabled: true },
        ]),
      },
    });
    const controller = new ContentTypesController(service);

    await expect(controller.listContentTypes()).resolves.toEqual({
      success: true,
      data: [{ id: 'novel', name: 'Novel', packId: 'novel-pack', enabled: true }],
      message: 'OK',
    });
  });

  it('treats an empty enabled content type list as a successful response', async () => {
    const service = createService({
      contentType: { findMany: vi.fn().mockResolvedValue([]) },
    });

    await expect(service.listEnabledContentTypes()).resolves.toEqual([]);
  });

  it('rejects unavailable content types with CONTENT_TYPE_NOT_AVAILABLE', async () => {
    const service = createService({
      contentType: { findUnique: vi.fn().mockResolvedValue(null) },
    });

    await expect(service.ensureEnabledContentType('disabled-type')).rejects.toMatchObject({
      response: { success: false, error: { code: 'CONTENT_TYPE_NOT_AVAILABLE' } },
    });
  });

  it('maps content type load failures to CONTENT_TYPES_LOAD_FAILED', async () => {
    const service = createService({
      contentType: { findMany: vi.fn().mockRejectedValue(new Error('database unavailable')) },
    });
    const controller = new ContentTypesController(service);

    await expect(controller.listContentTypes()).rejects.toMatchObject({
      response: { success: false, error: { code: 'CONTENT_TYPES_LOAD_FAILED' } },
    });
  });
});
