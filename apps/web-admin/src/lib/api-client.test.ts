import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createContentProject,
  createPromptTemplate,
  deleteContentProject,
  getContentProject,
  getDefaultLlmProvider,
  getPromptTemplate,
  listContentProjects,
  listContentTypes,
  listPromptTemplates,
  saveDefaultLlmProvider,
  updateContentProject,
} from './api-client';

describe('web-admin API client contract (Task-10)', () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  function stubFetch(body: unknown, ok = true): void {
    fetchMock.mockResolvedValue({
      ok,
      json: async () => body,
    });
    vi.stubGlobal('fetch', fetchMock);
  }

  it.each([
    ['listContentTypes', () => listContentTypes(), '/api/v1/content-types', 'GET'],
    ['listContentProjects', () => listContentProjects(), '/api/v1/content-projects', 'GET'],
    ['getContentProject', () => getContentProject('project_1'), '/api/v1/content-projects/project_1', 'GET'],
    ['deleteContentProject', () => deleteContentProject('project_1'), '/api/v1/content-projects/project_1', 'DELETE'],
    ['listPromptTemplates', () => listPromptTemplates(), '/api/v1/prompt-templates', 'GET'],
    ['getPromptTemplate', () => getPromptTemplate('template_1'), '/api/v1/prompt-templates/template_1', 'GET'],
    ['getDefaultLlmProvider', () => getDefaultLlmProvider(), '/api/v1/llm-providers/default', 'GET'],
  ])('calls %s with %s %s', async (_name, action, path, method) => {
    stubFetch({ success: true, data: null, message: 'OK' });

    await action();

    expect(fetchMock).toHaveBeenCalledWith(path, expect.objectContaining({ method }));
  });

  it('sends create content project requests to the content projects endpoint', async () => {
    stubFetch({ success: true, data: { id: 'project_1' }, message: 'OK' });

    await createContentProject({
      name: 'Evergreen Content Plan',
      contentTypeId: 'novel',
      targetPlatform: 'web',
      targetContentCount: 12,
      defaultGenerationParams: { tone: 'warm' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/content-projects',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Evergreen Content Plan',
          contentTypeId: 'novel',
          targetPlatform: 'web',
          targetContentCount: 12,
          defaultGenerationParams: { tone: 'warm' },
        }),
      }),
    );
  });

  it('sends update content project requests to the project detail endpoint', async () => {
    stubFetch({ success: true, data: { id: 'project_1' }, message: 'OK' });

    await updateContentProject('project_1', {
      name: 'Updated Content Plan',
      targetPlatform: 'wechat',
      targetContentCount: 24,
      defaultGenerationParams: { style: 'concise' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/content-projects/project_1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('sends prompt template save requests with content type, purpose, content, and version', async () => {
    stubFetch({ success: true, data: { id: 'template_1' }, message: 'OK' });

    await createPromptTemplate({
      name: 'Outline prompt',
      contentTypeId: 'novel',
      purpose: 'outline-agent',
      content: 'Generate a structured content outline.',
      version: 'v1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/prompt-templates',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends default LLM Provider saves without exposing full API key in the returned DTO', async () => {
    stubFetch({
      success: true,
      data: {
        id: 'default',
        name: 'OpenAI Compatible',
        model: 'claude-sonnet-4-6',
        enabled: true,
        apiKeyConfigured: true,
        apiKeyPreview: 'sk-***abcd',
        createdAt: '2026-05-11T00:00:00.000Z',
        updatedAt: '2026-05-11T00:00:00.000Z',
      },
      message: 'OK',
    });

    const dto = await saveDefaultLlmProvider({
      name: 'OpenAI Compatible',
      model: 'claude-sonnet-4-6',
      apiKey: 'sk-test-1234567890abcd',
      enabled: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/llm-providers/default',
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(JSON.stringify(dto)).not.toContain('sk-test-1234567890abcd');
    expect(dto).not.toHaveProperty('apiKey');
  });

  it('preserves API error codes for UI retry and error states', async () => {
    stubFetch(
      {
        success: false,
        error: { code: 'CONTENT_PROJECTS_LOAD_FAILED', message: 'Load failed' },
      },
      false,
    );

    await expect(listContentProjects()).rejects.toMatchObject({
      code: 'CONTENT_PROJECTS_LOAD_FAILED',
    });
  });
});
