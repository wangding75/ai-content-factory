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

function encryptApiKey(apiKey: string): string {
  return `encrypted:${apiKey}`;
}

function apiKeyPreview(encryptedApiKeyValue: string): string | null {
  const apiKey = encryptedApiKeyValue.replace(/^encrypted:/, '');

  if (!apiKey) {
    return null;
  }

  return `${apiKey.slice(0, 3)}***${apiKey.slice(-4)}`;
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
