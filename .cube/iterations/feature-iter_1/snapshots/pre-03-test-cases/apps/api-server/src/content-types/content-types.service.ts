import type { ContentTypeDto } from '@ai-content-factory/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentTypesService {
  async listEnabledContentTypes(): Promise<ContentTypeDto[]> {
    throw new Error('not implemented');
  }

  async ensureEnabledContentType(contentTypeId: string): Promise<ContentTypeDto> {
    void contentTypeId;
    throw new Error('not implemented');
  }
}
