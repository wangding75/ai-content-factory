import type {
  ContentProjectDetailDto,
  ContentProjectSummaryDto,
  ContentTypeDto,
  CreateContentProjectRequest,
  CreatePromptTemplateRequest,
  DeleteContentProjectResponse,
  LlmProviderSafeDto,
  PromptTemplateDetailDto,
  PromptTemplateSummaryDto,
  SaveDefaultLlmProviderRequest,
  UpdateContentProjectRequest,
} from '@ai-content-factory/shared';

export async function listContentTypes(): Promise<ContentTypeDto[]> {
  throw new Error('not implemented');
}

export async function listContentProjects(): Promise<ContentProjectSummaryDto[]> {
  throw new Error('not implemented');
}

export async function createContentProject(
  request: CreateContentProjectRequest,
): Promise<ContentProjectDetailDto> {
  void request;
  throw new Error('not implemented');
}

export async function getContentProject(id: string): Promise<ContentProjectDetailDto> {
  void id;
  throw new Error('not implemented');
}

export async function updateContentProject(
  id: string,
  request: UpdateContentProjectRequest,
): Promise<ContentProjectDetailDto> {
  void id;
  void request;
  throw new Error('not implemented');
}

export async function deleteContentProject(id: string): Promise<DeleteContentProjectResponse> {
  void id;
  throw new Error('not implemented');
}

export async function listPromptTemplates(): Promise<PromptTemplateSummaryDto[]> {
  throw new Error('not implemented');
}

export async function createPromptTemplate(
  request: CreatePromptTemplateRequest,
): Promise<PromptTemplateDetailDto> {
  void request;
  throw new Error('not implemented');
}

export async function getPromptTemplate(id: string): Promise<PromptTemplateDetailDto> {
  void id;
  throw new Error('not implemented');
}

export async function getDefaultLlmProvider(): Promise<LlmProviderSafeDto | null> {
  throw new Error('not implemented');
}

export async function saveDefaultLlmProvider(
  request: SaveDefaultLlmProviderRequest,
): Promise<LlmProviderSafeDto> {
  void request;
  throw new Error('not implemented');
}
