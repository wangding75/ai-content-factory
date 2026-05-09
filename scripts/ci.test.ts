import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..');

describe('scripts/ci.sh - naming-check (Task-13)', () => {
  it('grep detects prohibited names (book/chapter/novel) in packages/core/src', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-naming-'));
    try {
      const coreDir = path.join(tmpDir, 'packages', 'core', 'src');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'index.ts'), 'export const novel = "test";');

      // grep exits 0 when it finds a match — naming violation detected → CI would fail
      const result = spawnSync(
        'grep',
        ['-riqE', 'book|chapter|novel', 'packages/core/src/'],
        { cwd: tmpDir, encoding: 'utf-8' },
      );
      expect(result.status).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it('grep exits 1 when no prohibited names in packages/core/src (naming-check passes)', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-naming-'));
    try {
      const coreDir = path.join(tmpDir, 'packages', 'core', 'src');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'index.ts'), 'export const content = "test";');

      const result = spawnSync(
        'grep',
        ['-riqE', 'book|chapter|novel', 'packages/core/src/'],
        { cwd: tmpDir, encoding: 'utf-8' },
      );
      expect(result.status).toBe(1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it('root-name-check: package.json name is "ai-content-factory"', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf-8'),
    ) as { name: string };
    expect(pkg.name).toBe('ai-content-factory');
  });

  it('ci.sh exists as a regular file', () => {
    const ciScript = path.join(REPO_ROOT, 'scripts', 'ci.sh');
    expect(fs.existsSync(ciScript)).toBe(true);
    expect(fs.statSync(ciScript).isFile()).toBe(true);
  });

  // Integration-only: requires the full dev environment (install/lint/typecheck/test chain)
  it.todo('ci.sh exits 1 and prints STEP FAILED: root-name-check when package.json name is wrong');
  // Requires live PostgreSQL connection
  it.todo('pnpm db:check exits 0 when PostgreSQL is reachable — integration environment required');
});
