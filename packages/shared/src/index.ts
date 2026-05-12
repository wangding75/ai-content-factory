const API_ERROR_CODE_VALUES = [
  'VALIDATION_ERROR',
  'CONTENT_TYPES_LOAD_FAILED',
  'CONTENT_TYPE_NOT_AVAILABLE',
  'CONTENT_PROJECTS_LOAD_FAILED',
  'CONTENT_PROJECT_NOT_FOUND',
  'CONTENT_PROJECT_LOAD_FAILED',
  'CONTENT_PROJECT_CREATE_FAILED',
  'CONTENT_PROJECT_SAVE_FAILED',
  'CONTENT_PROJECT_DELETE_FAILED',
  'PROMPT_TEMPLATES_LOAD_FAILED',
  'PROMPT_TEMPLATE_NOT_FOUND',
  'PROMPT_TEMPLATE_LOAD_FAILED',
  'PROMPT_TEMPLATE_CREATE_FAILED',
  'LLM_PROVIDER_LOAD_FAILED',
  'LLM_PROVIDER_SAVE_FAILED',
] as const;

export const API_ERROR_CODES = [...API_ERROR_CODE_VALUES] as readonly string[];

export type ApiErrorCode = (typeof API_ERROR_CODE_VALUES)[number];


export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ContentProjectStatus = 'draft' | 'active' | 'archived';

export interface ContentTypeDto {
  id: string;
  name: string;
  packId: string;
  enabled: boolean;
}

export interface CreateContentProjectRequest {
  name: string;
  contentTypeId: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
}

export interface UpdateContentProjectRequest {
  name: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
}

export interface ContentProjectSummaryDto {
  id: string;
  name: string;
  contentType: ContentTypeDto;
  targetPlatform: string;
  targetContentCount: number;
  status: ContentProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContentProjectDetailDto extends ContentProjectSummaryDto {
  defaultGenerationParams: Record<string, unknown>;
  promptTemplates: PromptTemplateSummaryDto[];
  defaultLlmProvider: LlmProviderSafeDto | null;
}

export interface DeleteContentProjectResponse {
  id: string;
  deleted: true;
}

export interface CreatePromptTemplateRequest {
  name: string;
  contentTypeId: string;
  purpose: string;
  content: string;
  version: string;
}

export interface PromptTemplateSummaryDto {
  id: string;
  name: string;
  contentType: ContentTypeDto;
  purpose: string;
  version: string;
  contentPreview: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplateDetailDto extends PromptTemplateSummaryDto {
  content: string;
}

export interface SaveDefaultLlmProviderRequest {
  name: string;
  model: string;
  baseUrl?: string;
  apiKey: string;
  enabled: boolean;
}

export interface LlmProviderSafeDto {
  id: 'default';
  name: string;
  model: string;
  baseUrl?: string;
  enabled: boolean;
  apiKeyConfigured: boolean;
  apiKeyPreview: string | null;
  createdAt: string;
  updatedAt: string;
}
