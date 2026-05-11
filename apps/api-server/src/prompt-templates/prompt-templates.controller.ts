import type {
  ApiSuccessResponse,
  CreatePromptTemplateRequest,
  PromptTemplateDetailDto,
  PromptTemplateSummaryDto,
} from '@ai-content-factory/shared';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { JoiValidationPipe } from '../common/joi-validation.pipe';
import { PromptTemplatesService } from './prompt-templates.service';
import { createPromptTemplateSchema } from './prompt-templates.validation';

@Controller('/api/v1/prompt-templates')
export class PromptTemplatesController {
  constructor(private readonly promptTemplatesService: PromptTemplatesService) {}

  @Get()
  async listPromptTemplates(): Promise<ApiSuccessResponse<PromptTemplateSummaryDto[]>> {
    const data = await this.promptTemplatesService.listPromptTemplates();

    return { success: true, data, message: 'OK' };
  }

  @Post()
  async createPromptTemplate(
    @Body(new JoiValidationPipe(createPromptTemplateSchema)) request: CreatePromptTemplateRequest,
  ): Promise<ApiSuccessResponse<PromptTemplateDetailDto>> {
    const data = await this.promptTemplatesService.createPromptTemplate(request);

    return { success: true, data, message: 'OK' };
  }

  @Get('/:id')
  async getPromptTemplate(
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<PromptTemplateDetailDto>> {
    const data = await this.promptTemplatesService.getPromptTemplate(id);

    return { success: true, data, message: 'OK' };
  }
}
