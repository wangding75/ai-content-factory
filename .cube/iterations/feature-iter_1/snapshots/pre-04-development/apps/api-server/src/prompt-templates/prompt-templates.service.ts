import type {
  CreatePromptTemplateRequest,
  PromptTemplateDetailDto,
  PromptTemplateSummaryDto,
} from '@ai-content-factory/shared';
import { Injectable } from '@nestjs/common';
import { ContentTypesService } from '../content-types/content-types.service';

@Injectable()
export class PromptTemplatesService {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  async listPromptTemplates(): Promise<PromptTemplateSummaryDto[]> {
    throw new Error('not implemented');
  }

  async createPromptTemplate(
    request: CreatePromptTemplateRequest,
  ): Promise<PromptTemplateDetailDto> {
    void request;
    void this.contentTypesService;
    throw new Error('not implemented');
  }

  async getPromptTemplate(id: string): Promise<PromptTemplateDetailDto> {
    void id;
    throw new Error('not implemented');
  }
}
