import type { ContentProjectEntity } from '@ai-content-factory/core';
import type {
  ContentProjectDetailDto,
  ContentProjectSummaryDto,
  CreateContentProjectRequest,
  DeleteContentProjectResponse,
  UpdateContentProjectRequest,
} from '@ai-content-factory/shared';
import { Injectable } from '@nestjs/common';
import { ContentTypesService } from '../content-types/content-types.service';

@Injectable()
export class ContentProjectsService {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  async listContentProjects(): Promise<ContentProjectSummaryDto[]> {
    throw new Error('not implemented');
  }

  async createContentProject(
    request: CreateContentProjectRequest,
  ): Promise<ContentProjectDetailDto> {
    void request;
    throw new Error('not implemented');
  }

  async getContentProject(id: string): Promise<ContentProjectDetailDto> {
    void id;
    throw new Error('not implemented');
  }

  async updateContentProject(
    id: string,
    request: UpdateContentProjectRequest,
  ): Promise<ContentProjectDetailDto> {
    void id;
    void request;
    throw new Error('not implemented');
  }

  async deleteContentProject(id: string): Promise<DeleteContentProjectResponse> {
    void id;
    throw new Error('not implemented');
  }

  toEntity(project: ContentProjectEntity): ContentProjectEntity {
    void this.contentTypesService;
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
