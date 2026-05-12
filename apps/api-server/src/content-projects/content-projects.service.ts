import type { ContentProjectEntity } from '@ai-content-factory/core';
import type {
  ApiErrorCode,
  ContentProjectDetailDto,
  ContentProjectStatus,
  ContentProjectSummaryDto,
  CreateContentProjectRequest,
  DeleteContentProjectResponse,
  LlmProviderSafeDto,
  PromptTemplateSummaryDto,
  UpdateContentProjectRequest,
} from '@ai-content-factory/shared';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContentTypesService } from '../content-types/content-types.service';
import { PrismaService } from '../prisma/prisma.service';

type ContentProjectRecord = ContentProjectEntity & {
  createdAt: Date;
  updatedAt: Date;
  contentType: ContentProjectSummaryDto['contentType'];
  promptTemplates?: PromptTemplateRecord[];
};

type PromptTemplateRecord = {
  id: string;
  name: string;
  contentType: ContentProjectSummaryDto['contentType'];
  purpose: string;
  content: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
};

type LlmProviderRecord = {
  id: 'default';
  name: string;
  model: string;
  baseUrl?: string;
  encryptedApiKeyValue: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ContentProjectsPrisma = PrismaService & {
  contentProject: {
    findMany(): Promise<ContentProjectRecord[]>;
    findUnique(args: { where: { id: string } }): Promise<ContentProjectRecord | null>;
    create(args: { data: CreateContentProjectRequest & { status: ContentProjectStatus } }): Promise<ContentProjectRecord>;
    update(args: { where: { id: string }; data: UpdateContentProjectRequest }): Promise<ContentProjectRecord>;
    delete(args: { where: { id: string } }): Promise<{ id: string }>;
  };
  llmProvider: {
    findUnique(args: { where: { id: 'default' } }): Promise<LlmProviderRecord | null>;
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

function isRecordNotFound(error: unknown): boolean {
  return (error as { code?: string }).code === 'P2025';
}

function toSummaryDto(project: ContentProjectRecord): ContentProjectSummaryDto {
  return {
    id: project.id,
    name: project.name,
    contentType: project.contentType,
    targetPlatform: project.targetPlatform,
    targetContentCount: project.targetContentCount,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

function toPromptTemplateSummaryDto(template: PromptTemplateRecord): PromptTemplateSummaryDto {
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

function toSafeLlmProvider(provider: LlmProviderRecord | null): LlmProviderSafeDto | null {
  if (!provider) {
    return null;
  }

  return {
    id: provider.id,
    name: provider.name,
    model: provider.model,
    baseUrl: provider.baseUrl,
    enabled: provider.enabled,
    apiKeyConfigured: provider.encryptedApiKeyValue.length > 0,
    apiKeyPreview: provider.encryptedApiKeyValue.length > 0 ? 'configured' : null,
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString(),
  };
}

function toDetailDto(project: ContentProjectRecord, defaultLlmProvider: LlmProviderSafeDto | null): ContentProjectDetailDto {
  return {
    ...toSummaryDto(project),
    defaultGenerationParams: project.defaultGenerationParams,
    promptTemplates: (project.promptTemplates ?? []).map(toPromptTemplateSummaryDto),
    defaultLlmProvider,
  };
}

@Injectable()
export class ContentProjectsService {
  constructor(
    private readonly contentTypesService: ContentTypesService,
    private readonly prisma: PrismaService,
  ) {}

  async listContentProjects(): Promise<ContentProjectSummaryDto[]> {
    try {
      return (await (this.prisma as ContentProjectsPrisma).contentProject.findMany()).map(toSummaryDto);
    } catch {
      throw apiError('CONTENT_PROJECTS_LOAD_FAILED', 'Failed to load content projects');
    }
  }

  async createContentProject(
    request: CreateContentProjectRequest,
  ): Promise<ContentProjectDetailDto> {
    await this.contentTypesService.ensureEnabledContentType(request.contentTypeId);

    try {
      const project = await (this.prisma as ContentProjectsPrisma).contentProject.create({
        data: { ...request, status: 'draft' },
      });

      return toDetailDto(project, null);
    } catch {
      throw apiError('CONTENT_PROJECT_CREATE_FAILED', 'Failed to create content project');
    }
  }

  async getContentProject(id: string): Promise<ContentProjectDetailDto> {
    try {
      const project = await (this.prisma as ContentProjectsPrisma).contentProject.findUnique({ where: { id } });

      if (!project) {
        throw apiError('CONTENT_PROJECT_NOT_FOUND', 'Content project was not found');
      }

      const defaultLlmProvider = await (this.prisma as ContentProjectsPrisma).llmProvider.findUnique({
        where: { id: 'default' },
      });

      return toDetailDto(project, toSafeLlmProvider(defaultLlmProvider));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw apiError('CONTENT_PROJECT_LOAD_FAILED', 'Failed to load content project');
    }
  }

  async updateContentProject(
    id: string,
    request: UpdateContentProjectRequest,
  ): Promise<ContentProjectDetailDto> {
    try {
      const project = await (this.prisma as ContentProjectsPrisma).contentProject.update({
        where: { id },
        data: request,
      });

      return toDetailDto(project, null);
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw apiError('CONTENT_PROJECT_NOT_FOUND', 'Content project was not found');
      }

      throw apiError('CONTENT_PROJECT_SAVE_FAILED', 'Failed to save content project');
    }
  }

  async deleteContentProject(id: string): Promise<DeleteContentProjectResponse> {
    try {
      const deleted = await (this.prisma as ContentProjectsPrisma).contentProject.delete({ where: { id } });

      return { id: deleted.id, deleted: true };
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw apiError('CONTENT_PROJECT_NOT_FOUND', 'Content project was not found');
      }

      throw apiError('CONTENT_PROJECT_DELETE_FAILED', 'Failed to delete content project');
    }
  }

  toEntity(project: ContentProjectEntity): ContentProjectEntity {
    return {
      id: project.id,
      name: project.name,
      contentTypeId: project.contentTypeId,
      targetPlatform: project.targetPlatform,
      targetContentCount: project.targetContentCount,
      defaultGenerationParams: project.defaultGenerationParams,
      status: project.status,
    };
  }
}
