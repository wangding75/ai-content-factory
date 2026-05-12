import type { LlmProviderSafeDto, SaveDefaultLlmProviderRequest } from '@ai-content-factory/shared';
import { Injectable } from '@nestjs/common';

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

@Injectable()
export class LlmProvidersService {
  async getDefaultProvider(): Promise<LlmProviderSafeDto | null> {
    throw new Error('not implemented');
  }

  async saveDefaultProvider(
    request: SaveDefaultLlmProviderRequest,
  ): Promise<LlmProviderSafeDto> {
    void request;
    throw new Error('not implemented');
  }

  toSafeDto(provider: LlmProviderRecord): LlmProviderSafeDto {
    void provider;
    throw new Error('not implemented');
  }
}
