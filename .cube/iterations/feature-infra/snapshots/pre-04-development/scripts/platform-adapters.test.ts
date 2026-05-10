import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf-8')) as T;
}

describe('platform adapters placeholder (Task-06)', () => {
  it('declares a private workspace package for platform adapters', () => {
    const pkg = readJson<{ name: string; private?: boolean }>('packages/platform-adapters/package.json');

    expect(pkg.name).toBe('@ai-content-factory/platform-adapters');
    expect(pkg.private).toBe(true);
  });

  it('documents that platform adapters are placeholders only', () => {
    const readme = fs.readFileSync(path.join(REPO_ROOT, 'packages/platform-adapters/README.md'), 'utf-8');

    expect(readme).toMatch(/adapter|适配器/i);
    expect(readme).toMatch(/placeholder|占位/i);
  });
});
