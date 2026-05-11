import { describe, it, expect } from 'vitest';

describe('@ai-content-factory/core (Task-04)', () => {
  it('module can be imported without errors', async () => {
    const mod = await import('./index');
    expect(mod).toBeDefined();
  });

  it('has no named exports (placeholder module)', async () => {
    const mod = await import('./index');
    const namedExports = Object.keys(mod).filter((k) => k !== 'default');
    expect(namedExports).toHaveLength(0);
  });
});
