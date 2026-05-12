import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('@ai-content-factory/shared public contract (Task-01)', () => {
  it('exports the complete API error code list used by API responses', async () => {
    const mod = await import('./index');

    expect(mod).toHaveProperty('API_ERROR_CODES');
    expect((mod as { API_ERROR_CODES?: string[] }).API_ERROR_CODES).toEqual([
      'VALIDATION_ERROR',
      'CONTENT_TYPES_LOAD_FAILED',
      'CONTENT_TYPE_NOT_AVAILABLE',
      'CONTENT_PROJECTS_LOAD_FAILED',
      'CONTENT_PROJECT_NOT_FOUND',
      'CONTENT_PROJECT_LOAD_FAILED',
      'CONTENT_PROJECT_CREATE_FAILED',
      'CONTENT_PROJECT_SAVE_FAILED',
      'CONTENT_PROJECT_DELETE_FAILED',
      'PROMPT_TEMPLATES_LOAD_FAILED',
      'PROMPT_TEMPLATE_NOT_FOUND',
      'PROMPT_TEMPLATE_LOAD_FAILED',
      'PROMPT_TEMPLATE_CREATE_FAILED',
      'LLM_PROVIDER_LOAD_FAILED',
      'LLM_PROVIDER_SAVE_FAILED',
    ]);
  });

  it('keeps LlmProviderSafeDto free of full API key fields', () => {
    const source = readFileSync(resolve(__dirname, 'index.ts'), 'utf8');
    const dtoBlock = source.match(/export interface LlmProviderSafeDto \{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(dtoBlock).toContain('apiKeyConfigured: boolean');
    expect(dtoBlock).toContain('apiKeyPreview: string | null');
    expect(dtoBlock).not.toMatch(/\bapiKey\s*:/);
    expect(dtoBlock).not.toContain('encryptedApiKeyValue');
  });

  it('defines ISO timestamp fields on project, prompt template, and provider DTOs', () => {
    const source = readFileSync(resolve(__dirname, 'index.ts'), 'utf8');

    for (const dtoName of [
      'ContentProjectSummaryDto',
      'PromptTemplateSummaryDto',
      'LlmProviderSafeDto',
    ]) {
      const dtoBlock = source.match(new RegExp(`export interface ${dtoName} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? '';
      expect(dtoBlock).toContain('createdAt: string');
      expect(dtoBlock).toContain('updatedAt: string');
    }
  });

  it('defines every DTO referenced by the API design', () => {
    const source = readFileSync(resolve(__dirname, 'index.ts'), 'utf8');

    for (const dtoName of [
      'ContentTypeDto',
      'CreateContentProjectRequest',
      'UpdateContentProjectRequest',
      'ContentProjectSummaryDto',
      'ContentProjectDetailDto',
      'DeleteContentProjectResponse',
      'CreatePromptTemplateRequest',
      'PromptTemplateSummaryDto',
      'PromptTemplateDetailDto',
      'SaveDefaultLlmProviderRequest',
      'LlmProviderSafeDto',
    ]) {
      expect(source).toContain(`export interface ${dtoName}`);
    }
  });
});
