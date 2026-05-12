import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');

describe('environment template (Task-02)', () => {
  it('.env.example declares all required placeholders', () => {
    const envExample = fs.readFileSync(path.join(REPO_ROOT, '.env.example'), 'utf-8');

    expect(envExample).toContain('PORT=3000');
    expect(envExample).toContain('DATABASE_URL=postgresql://user:pass@localhost:5432/ai_content_factory');
    expect(envExample).toContain('LOG_LEVEL=info');
    expect(envExample).toContain('LLM_PROVIDER_API_KEY=');
    expect(envExample).toContain('WEB_PORT=3001');
  });

  it('.env is ignored by git', () => {
    const gitignore = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf-8');

    expect(gitignore).toMatch(/^\.env$/m);
  });
});
