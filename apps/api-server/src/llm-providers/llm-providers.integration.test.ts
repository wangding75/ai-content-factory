import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { JoiValidationPipe } from '../common/joi-validation.pipe';
import { saveDefaultLlmProviderSchema } from './llm-providers.validation';
import { LlmProviderRecord, LlmProvidersService } from './llm-providers.service';

function createService(prisma: unknown): LlmProvidersService {
  return Reflect.construct(LlmProvidersService, [prisma]) as LlmProvidersService;
}

const providerRecord: LlmProviderRecord = {
  id: 'default',
  name: 'OpenAI Compatible',
  model: 'claude-sonnet-4-6',
  baseUrl: 'https://llm.example.test/v1',
  encryptedApiKeyValue: 'encrypted:sk-test-1234567890abcd',
  enabled: true,
  createdAt: new Date('2026-05-11T00:00:00.000Z'),
  updatedAt: new Date('2026-05-11T00:00:00.000Z'),
};

describe('LlmProviders API integration (Task-08)', () => {
  it('returns null when the default provider has not been configured', async () => {
    const service = createService({ llmProvider: { findUnique: vi.fn().mockResolvedValue(null) } });

    await expect(service.getDefaultProvider()).resolves.toBeNull();
  });

  it('saves the default provider and returns only a safe DTO', async () => {
    const service = createService({ llmProvider: { upsert: vi.fn().mockResolvedValue(providerRecord) } });

    await expect(
      service.saveDefaultProvider({
        name: 'OpenAI Compatible',
        model: 'claude-sonnet-4-6',
        baseUrl: 'https://llm.example.test/v1',
        apiKey: 'sk-test-1234567890abcd',
        enabled: true,
      }),
    ).resolves.toEqual({
      id: 'default',
      name: 'OpenAI Compatible',
      model: 'claude-sonnet-4-6',
      baseUrl: 'https://llm.example.test/v1',
      enabled: true,
      apiKeyConfigured: true,
      apiKeyPreview: 'sk-***abcd',
      createdAt: '2026-05-11T00:00:00.000Z',
      updatedAt: '2026-05-11T00:00:00.000Z',
    });
  });

  it('rejects invalid baseUrl protocols with VALIDATION_ERROR', () => {
    const pipe = new JoiValidationPipe(saveDefaultLlmProviderSchema);
    let caughtError: unknown;
    try {
      pipe.transform({ name: 'OpenAI Compatible', model: 'claude-sonnet-4-6', baseUrl: 'file:///tmp/key', apiKey: 'sk-test-1234567890abcd', enabled: true });
    } catch (e) { caughtError = e; }
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).getResponse()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('rejects syntactically malformed baseUrls with VALIDATION_ERROR', () => {
    const pipe = new JoiValidationPipe(saveDefaultLlmProviderSchema);
    let caughtError: unknown;
    try {
      pipe.transform({ name: 'OpenAI Compatible', model: 'claude-sonnet-4-6', baseUrl: 'not-a-url', apiKey: 'sk-test-1234567890abcd', enabled: true });
    } catch (e) { caughtError = e; }
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).getResponse()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it.each([
    [{ name: '', model: 'claude-sonnet-4-6', apiKey: 'sk-test-1234567890abcd', enabled: true }],
    [{ name: 'OpenAI Compatible', model: '', apiKey: 'sk-test-1234567890abcd', enabled: true }],
    [{ name: 'OpenAI Compatible', model: 'claude-sonnet-4-6', apiKey: '', enabled: true }],
  ])('rejects missing required provider fields with VALIDATION_ERROR (%o)', (payload) => {
    const pipe = new JoiValidationPipe(saveDefaultLlmProviderSchema);
    let caughtError: unknown;
    try { pipe.transform(payload); } catch (e) { caughtError = e; }
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).getResponse()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('converts provider records to safe DTOs without exposing full API keys', () => {
    const service = createService({});
    const dto = service.toSafeDto(providerRecord);

    expect(dto).toEqual({
      id: 'default',
      name: 'OpenAI Compatible',
      model: 'claude-sonnet-4-6',
      baseUrl: 'https://llm.example.test/v1',
      enabled: true,
      apiKeyConfigured: true,
      apiKeyPreview: 'sk-***abcd',
      createdAt: '2026-05-11T00:00:00.000Z',
      updatedAt: '2026-05-11T00:00:00.000Z',
    });
    expect(JSON.stringify(dto)).not.toContain('sk-test-1234567890abcd');
    expect(dto).not.toHaveProperty('encryptedApiKeyValue');
    expect(dto).not.toHaveProperty('apiKey');
  });

  it.each([
    ['load', { llmProvider: { findUnique: vi.fn().mockRejectedValue(new Error('db down')) } }, 'LLM_PROVIDER_LOAD_FAILED'],
    ['save', { llmProvider: { upsert: vi.fn().mockRejectedValue(new Error('db down')) } }, 'LLM_PROVIDER_SAVE_FAILED'],
  ])('maps %s failures to the expected API error code without leaking secrets', async (name, prisma, code) => {
    const service = createService(prisma);
    const action =
      name === 'load'
        ? () => service.getDefaultProvider()
        : () => service.saveDefaultProvider({ name: 'OpenAI Compatible', model: 'claude-sonnet-4-6', apiKey: 'sk-test-1234567890abcd', enabled: true });

    await expect(action()).rejects.toMatchObject({
      response: { success: false, error: { code, message: expect.not.stringContaining('sk-test') } },
    });
  });
});
