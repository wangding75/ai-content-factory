import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('packages/core naming boundary (Task-04)', () => {
  it('grep detects prohibited variable names in packages/core/src', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-naming-'));
    try {
      const coreDir = path.join(tmpDir, 'packages', 'core', 'src');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'index.ts'), 'export const novel = "test";');

      const result = spawnSync(
        'grep',
        ['-riqE', 'book|chapter|novel', 'packages/core/src/'],
        { cwd: tmpDir, encoding: 'utf-8' },
      );
      expect(result.status).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('grep detects prohibited class names in packages/core/src', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-naming-'));
    try {
      const coreDir = path.join(tmpDir, 'packages', 'core', 'src');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'index.ts'), 'export class BookService {}');

      const result = spawnSync(
        'grep',
        ['-riqE', 'book|chapter|novel', 'packages/core/src/'],
        { cwd: tmpDir, encoding: 'utf-8' },
      );
      expect(result.status).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('grep detects prohibited file names in packages/core/src', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-naming-'));
    try {
      const coreDir = path.join(tmpDir, 'packages', 'core', 'src');
      fs.mkdirSync(coreDir, { recursive: true });
      fs.writeFileSync(path.join(coreDir, 'novel-helper.ts'), 'export const content = "test";');

      const result = spawnSync(
        'grep',
        ['-riqE', 'book|chapter|novel', 'packages/core/src/'],
        { cwd: tmpDir, encoding: 'utf-8' },
      );
      expect(result.status).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('grep exits 1 when no prohibited names exist in packages/core/src', () => {
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
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
