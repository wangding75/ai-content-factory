import type {
  ApiSuccessResponse,
  ContentProjectDetailDto,
  ContentProjectSummaryDto,
  CreateContentProjectRequest,
  DeleteContentProjectResponse,
  UpdateContentProjectRequest,
} from '@ai-content-factory/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { JoiValidationPipe } from '../common/joi-validation.pipe';
import { ContentProjectsService } from './content-projects.service';
import {
  createContentProjectSchema,
  updateContentProjectSchema,
} from './content-projects.validation';

@Controller('/api/v1/content-projects')
export class ContentProjectsController {
  constructor(private readonly contentProjectsService: ContentProjectsService) {}

  @Get()
  async listContentProjects(): Promise<ApiSuccessResponse<ContentProjectSummaryDto[]>> {
    const data = await this.contentProjectsService.listContentProjects();

    return { success: true, data, message: 'OK' };
  }

  @Post()
  async createContentProject(
    @Body(new JoiValidationPipe(createContentProjectSchema)) request: CreateContentProjectRequest,
  ): Promise<ApiSuccessResponse<ContentProjectDetailDto>> {
    const data = await this.contentProjectsService.createContentProject(request);

    return { success: true, data, message: 'OK' };
  }

  @Get('/:id')
  async getContentProject(
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<ContentProjectDetailDto>> {
    const data = await this.contentProjectsService.getContentProject(id);

    return { success: true, data, message: 'OK' };
  }

  @Patch('/:id')
  async updateContentProject(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateContentProjectSchema)) request: UpdateContentProjectRequest,
  ): Promise<ApiSuccessResponse<ContentProjectDetailDto>> {
    const data = await this.contentProjectsService.updateContentProject(id, request);

    return { success: true, data, message: 'OK' };
  }

  @Delete('/:id')
  async deleteContentProject(
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<DeleteContentProjectResponse>> {
    const data = await this.contentProjectsService.deleteContentProject(id);

    return { success: true, data, message: 'OK' };
  }
}
