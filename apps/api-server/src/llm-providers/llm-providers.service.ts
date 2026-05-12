import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import type {
  ApiErrorCode,
  LlmProviderSafeDto,
  SaveDefaultLlmProviderRequest,
} from '@ai-content-factory/shared';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LlmProviderRecord {
  id: 'default';
  name: string;
  model: string;
  baseUrl?: string;
  encryptedApiKeyValue: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type LlmProvidersPrisma = PrismaService & {
  llmProvider: {
    findUnique(args: { where: { id: 'default' } }): Promise<LlmProviderRecord | null>;
    upsert(args: {
      where: { id: 'default' };
      create: Omit<LlmProviderRecord, 'createdAt' | 'updatedAt'>;
      update: Omit<LlmProviderRecord, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<LlmProviderRecord>;
  };
};

function apiError(code: ApiErrorCode, message: string): HttpException {
  return new HttpException(
    {
      success: false,
      error: { code, message },
    },
    HttpStatus.BAD_REQUEST,
  );
}

function encryptionKey(): Buffer {
  const key = process.env['LLM_PROVIDER_API_KEY_ENCRYPTION_KEY'];

  if (!key || key.length < 32) {
    throw apiError('LLM_PROVIDER_SAVE_FAILED', 'LLM provider encryption key is not configured');
  }

  return createHash('sha256').update(key).digest();
}

function encryptApiKey(apiKey: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `aes-256-gcm:${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

function apiKeyPreview(encryptedApiKeyValue: string): string | null {
  if (!encryptedApiKeyValue) {
    return null;
  }

  if (encryptedApiKeyValue.startsWith('encrypted:')) {
    const apiKey = encryptedApiKeyValue.replace(/^encrypted:/, '');

    return apiKey ? `${apiKey.slice(0, 3)}***${apiKey.slice(-4)}` : null;
  }

  return 'configured';
}

@Injectable()
export class LlmProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultProvider(): Promise<LlmProviderSafeDto | null> {
    try {
      const provider = await (this.prisma as LlmProvidersPrisma).llmProvider.findUnique({
        where: { id: 'default' },
      });

      return provider ? this.toSafeDto(provider) : null;
    } catch {
      throw apiError('LLM_PROVIDER_LOAD_FAILED', 'Failed to load LLM provider');
    }
  }

  async saveDefaultProvider(
    request: SaveDefaultLlmProviderRequest,
  ): Promise<LlmProviderSafeDto> {
    try {
      const encryptedApiKeyValue = encryptApiKey(request.apiKey);
      const provider = await (this.prisma as LlmProvidersPrisma).llmProvider.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          name: request.name,
          model: request.model,
          baseUrl: request.baseUrl,
          encryptedApiKeyValue,
          enabled: request.enabled,
        },
        update: {
          name: request.name,
          model: request.model,
          baseUrl: request.baseUrl,
          encryptedApiKeyValue,
          enabled: request.enabled,
        },
      });

      return this.toSafeDto(provider);
    } catch {
      throw apiError('LLM_PROVIDER_SAVE_FAILED', 'Failed to save LLM provider');
    }
  }

  toSafeDto(provider: LlmProviderRecord): LlmProviderSafeDto {
    return {
      id: provider.id,
      name: provider.name,
      model: provider.model,
      baseUrl: provider.baseUrl,
      enabled: provider.enabled,
      apiKeyConfigured: provider.encryptedApiKeyValue.length > 0,
      apiKeyPreview: apiKeyPreview(provider.encryptedApiKeyValue),
      createdAt: provider.createdAt.toISOString(),
      updatedAt: provider.updatedAt.toISOString(),
    };
  }
}
