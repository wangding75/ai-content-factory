import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schema = readFileSync(resolve(__dirname, '../../prisma/schema.prisma'), 'utf8');

function modelBlock(modelName: string): string {
  return schema.match(new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? '';
}

describe('Prisma schema contract (Task-04)', () => {
  it('defines generic content type, project, prompt template, and LLM provider models', () => {
    for (const modelName of ['ContentType', 'ContentProject', 'PromptTemplate', 'LlmProvider']) {
      expect(modelBlock(modelName)).not.toBe('');
    }
  });

  it('maps models to the expected table names and indexes', () => {
    expect(modelBlock('ContentType')).toContain('@@map("content_types")');
    expect(modelBlock('ContentType')).toContain('@@index([enabled])');
    expect(modelBlock('ContentProject')).toContain('@@map("content_projects")');
    expect(modelBlock('ContentProject')).toContain('@@index([contentTypeId])');
    expect(modelBlock('ContentProject')).toContain('@@index([status])');
    expect(modelBlock('ContentProject')).toContain('@@index([updatedAt])');
    expect(modelBlock('PromptTemplate')).toContain('@@map("prompt_templates")');
    expect(modelBlock('PromptTemplate')).toContain('@@index([contentTypeId])');
    expect(modelBlock('PromptTemplate')).toContain('@@index([purpose])');
    expect(modelBlock('PromptTemplate')).toContain('@@index([version])');
    expect(modelBlock('LlmProvider')).toContain('@@map("llm_providers")');
    expect(modelBlock('LlmProvider')).toContain('@@index([enabled])');
  });

  it('stores LLM provider secrets only as encrypted API key values', () => {
    const provider = modelBlock('LlmProvider');

    expect(provider).toContain('encryptedApiKeyValue String');
    expect(provider).not.toMatch(/\bapiKey\b/);
    expect(provider).not.toMatch(/plain|secret/i);
  });

  it('declares target content counts as integer fields validated at API boundaries', () => {
    expect(modelBlock('ContentProject')).toMatch(/targetContentCount\s+Int\b/);
  });

  it('does not introduce book or chapter concepts into core schema models', () => {
    expect(schema).not.toMatch(/\b(book|chapter)\b/i);
  });
});
