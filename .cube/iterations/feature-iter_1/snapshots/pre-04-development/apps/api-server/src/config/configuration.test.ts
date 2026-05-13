import { describe, it, expect } from 'vitest';
import { validationSchema } from './configuration';

describe('validationSchema (Task-08)', () => {
  const validBase = { DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' };

  it('accepts a valid configuration with DATABASE_URL', () => {
    const { error } = validationSchema.validate(validBase, {
      allowUnknown: true,
      abortEarly: false,
    });
    expect(error).toBeUndefined();
  });

  it('rejects missing DATABASE_URL with a validation error mentioning the field', () => {
    const { error } = validationSchema.validate(
      {},
      { allowUnknown: true, abortEarly: false },
    );
    expect(error).toBeDefined();
    expect(error!.message).toMatch(/DATABASE_URL/i);
  });

  it('defaults PORT to 3000 when not provided', () => {
    const { value } = validationSchema.validate(validBase, {
      allowUnknown: true,
      abortEarly: false,
    });
    expect(value.PORT).toBe(3000);
  });

  it('defaults LOG_LEVEL to "info" when not provided', () => {
    const { value } = validationSchema.validate(validBase, {
      allowUnknown: true,
      abortEarly: false,
    });
    expect(value.LOG_LEVEL).toBe('info');
  });

  it('allows LLM_PROVIDER_API_KEY to be an empty string', () => {
    const { error } = validationSchema.validate(
      { ...validBase, LLM_PROVIDER_API_KEY: '' },
      { allowUnknown: true, abortEarly: false },
    );
    expect(error).toBeUndefined();
  });
});
