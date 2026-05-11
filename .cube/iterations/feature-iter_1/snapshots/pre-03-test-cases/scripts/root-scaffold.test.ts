import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf-8')) as T;
}

describe('root scaffold configuration (Task-01)', () => {
  it('declares all required workspace package globs', () => {
    const workspace = fs.readFileSync(path.join(REPO_ROOT, 'pnpm-workspace.yaml'), 'utf-8');

    expect(workspace).toContain('- "apps/*"');
    expect(workspace).toContain('- "packages/*"');
    expect(workspace).toContain('- "packages/content-packs/*"');
    expect(workspace).toContain('- "packages/platform-adapters"');
  });

  it('root package exposes lint, typecheck, test, build, and ci scripts', () => {
    const pkg = readJson<{ scripts: Record<string, string> }>('package.json');

    expect(pkg.scripts).toMatchObject({
      lint: expect.any(String),
      typecheck: expect.any(String),
      test: expect.any(String),
      build: expect.any(String),
      'ci:check': expect.any(String),
    });
  });

  it('base TypeScript config enables strict mode', () => {
    const tsconfig = readJson<{ compilerOptions: { strict?: boolean } }>('tsconfig.base.json');

    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('.gitignore excludes environment and build artifacts', () => {
    const gitignore = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf-8');

    expect(gitignore).toMatch(/^\.env$/m);
    expect(gitignore).toMatch(/^node_modules$/m);
    expect(gitignore).toMatch(/^dist$/m);
    expect(gitignore).toMatch(/^\.next$/m);
  });
});
