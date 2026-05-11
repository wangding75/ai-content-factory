import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf-8')) as T;
}

describe('api-server framework scaffold (Task-07)', () => {
  it('declares NestJS package metadata and scripts', () => {
    const pkg = readJson<{ name: string; scripts: Record<string, string>; dependencies: Record<string, string> }>('apps/api-server/package.json');

    expect(pkg.name).toBe('@ai-content-factory/api-server');
    expect(pkg.scripts['start:dev']).toContain('nest start');
    expect(pkg.dependencies['@nestjs/core']).toBeDefined();
  });

  it('defines NestJS bootstrap and root module files', () => {
    expect(fs.existsSync(path.join(REPO_ROOT, 'apps/api-server/src/main.ts'))).toBe(true);
    expect(fs.existsSync(path.join(REPO_ROOT, 'apps/api-server/src/app.module.ts'))).toBe(true);
  });
});
