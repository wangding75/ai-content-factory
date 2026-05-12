import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('@ai-content-factory/core content project contract (Task-02)', () => {
  it('exports ContentProjectEntity as the generic content project domain interface', () => {
    const source = readFileSync(resolve(__dirname, 'index.ts'), 'utf8');
    const entityBlock = source.match(/export interface ContentProjectEntity \{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(entityBlock).toContain('id: string');
    expect(entityBlock).toContain('name: string');
    expect(entityBlock).toContain('contentTypeId: string');
    expect(entityBlock).toContain('targetPlatform: string');
    expect(entityBlock).toContain('targetContentCount: number');
    expect(entityBlock).toContain('defaultGenerationParams: Record<string, unknown>');
    expect(entityBlock).toContain('status: ContentProjectStatus');
  });

  it('reuses the shared ContentProjectStatus type instead of redefining status locally', () => {
    const source = readFileSync(resolve(__dirname, 'index.ts'), 'utf8');

    expect(source).toContain("import type { ContentProjectStatus } from '@ai-content-factory/shared'");
    expect(source).not.toMatch(/export type ContentProjectStatus\s*=/);
  });

  it('does not expose book or chapter as core content project concepts', () => {
    const source = readFileSync(resolve(__dirname, 'index.ts'), 'utf8');

    expect(source).not.toMatch(/\b(book|chapter)\b/i);
  });
});
