import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');

describe('docs directory scaffold (Task-14)', () => {
  it('contains required docs subdirectories', () => {
    for (const dir of ['product', 'architecture', 'iterations', 'content-packs']) {
      expect(fs.statSync(path.join(REPO_ROOT, 'docs', dir)).isDirectory()).toBe(true);
    }
  });

  it('keeps required root iteration and blueprint documents', () => {
    for (const file of [
      '00-product-blueprint.md',
      '00-product-blueprint-README.md',
      'iteration-README.md',
      'iteration-0-scaffold-requirements.md',
    ]) {
      expect(fs.existsSync(path.join(REPO_ROOT, 'docs', file))).toBe(true);
    }
  });
});
