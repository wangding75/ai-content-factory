import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');

describe('scripts/ci.sh (Task-13)', () => {
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

  it('ci.sh emits STEP FAILED for each run_step failure', () => {
    const script = fs.readFileSync(path.join(REPO_ROOT, 'scripts', 'ci.sh'), 'utf-8');

    expect(script).toContain('STEP FAILED: $name');
  });

  it('pnpm db:check exits non-zero when PostgreSQL is unreachable', () => {
    const result = spawnSync(
      'pnpm',
      ['--filter', '@ai-content-factory/api-server', 'db:check'],
      {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
        env: {
          ...process.env,
          DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/ai_content_factory',
        },
      },
    );

    expect(result.status).not.toBe(0);
  });

  // Integration-only: requires the full dev environment (install/lint/typecheck/test chain)
  it.todo('ci.sh exits 1 and prints STEP FAILED: root-name-check when package.json name is wrong');
  // Requires live PostgreSQL connection
  it.todo('pnpm db:check exits 0 when PostgreSQL is reachable — integration environment required');
});
