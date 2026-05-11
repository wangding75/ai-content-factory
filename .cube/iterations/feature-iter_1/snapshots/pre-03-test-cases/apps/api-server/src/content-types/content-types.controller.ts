import type { ApiSuccessResponse, ContentTypeDto } from '@ai-content-factory/shared';
import { Controller, Get } from '@nestjs/common';
import { ContentTypesService } from './content-types.service';

@Controller('/api/v1/content-types')
export class ContentTypesController {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  @Get()
  async listContentTypes(): Promise<ApiSuccessResponse<ContentTypeDto[]>> {
    const data = await this.contentTypesService.listEnabledContentTypes();

    return { success: true, data, message: 'OK' };
  }
}
