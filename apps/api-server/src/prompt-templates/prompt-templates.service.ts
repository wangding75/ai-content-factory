import type {
  ApiErrorCode,
  CreatePromptTemplateRequest,
  PromptTemplateDetailDto,
  PromptTemplateSummaryDto,
} from '@ai-content-factory/shared';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContentTypesService } from '../content-types/content-types.service';
import { PrismaService } from '../prisma/prisma.service';

type PromptTemplateRecord = {
  id: string;
  name: string;
  contentTypeId: string;
  contentType: PromptTemplateSummaryDto['contentType'];
  purpose: string;
  content: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
};

type PromptTemplatesPrisma = PrismaService & {
  promptTemplate: {
    findMany(args: PromptTemplateRelationArgs): Promise<PromptTemplateRecord[]>;
    findUnique(args: PromptTemplateRelationArgs & { where: { id: string } }): Promise<PromptTemplateRecord | null>;
    create(args: { data: CreatePromptTemplateRequest } & PromptTemplateRelationArgs): Promise<PromptTemplateRecord>;
  };
};

type PromptTemplateRelationArgs = {
  include: { contentType: true };
};

const promptTemplateInclude = {
  include: { contentType: true },
} satisfies PromptTemplateRelationArgs;

function apiError(code: ApiErrorCode, message: string): HttpException {
  return new HttpException(
    {
      success: false,
      error: { code, message },
    },
    HttpStatus.BAD_REQUEST,
  );
}

function toSummaryDto(template: PromptTemplateRecord): PromptTemplateSummaryDto {
  return {
    id: template.id,
    name: template.name,
    contentType: template.contentType,
    purpose: template.purpose,
    version: template.version,
    contentPreview: template.content.slice(0, 120),
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

function toDetailDto(template: PromptTemplateRecord): PromptTemplateDetailDto {
  return {
    ...toSummaryDto(template),
    content: template.content,
  };
}

@Injectable()
export class PromptTemplatesService {
  constructor(
    private readonly contentTypesService: ContentTypesService,
    private readonly prisma: PrismaService,
  ) {}

  async listPromptTemplates(): Promise<PromptTemplateSummaryDto[]> {
    try {
      return (await (this.prisma as PromptTemplatesPrisma).promptTemplate.findMany(promptTemplateInclude)).map(toSummaryDto);
    } catch {
      throw apiError('PROMPT_TEMPLATES_LOAD_FAILED', 'Failed to load prompt templates');
    }
  }

  async createPromptTemplate(
    request: CreatePromptTemplateRequest,
  ): Promise<PromptTemplateDetailDto> {
    await this.contentTypesService.ensureEnabledContentType(request.contentTypeId);

    try {
      const template = await (this.prisma as PromptTemplatesPrisma).promptTemplate.create({
        data: request,
        ...promptTemplateInclude,
      });

      return toDetailDto(template);
    } catch {
      throw apiError('PROMPT_TEMPLATE_CREATE_FAILED', 'Failed to create prompt template');
    }
  }

  async getPromptTemplate(id: string): Promise<PromptTemplateDetailDto> {
    try {
      const template = await (this.prisma as PromptTemplatesPrisma).promptTemplate.findUnique({
        where: { id },
        ...promptTemplateInclude,
      });

      if (!template) {
        throw apiError('PROMPT_TEMPLATE_NOT_FOUND', 'Prompt template was not found');
      }

      return toDetailDto(template);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw apiError('PROMPT_TEMPLATE_LOAD_FAILED', 'Failed to load prompt template');
    }
  }
}
