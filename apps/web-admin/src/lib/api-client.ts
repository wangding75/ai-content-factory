import type {
  ApiErrorResponse,
  ApiSuccessResponse,
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

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const body = await parseResponse<T>(response);

  if (!response.ok || !body.success) {
    throw body.success ? new Error('Request failed') : body.error;
  }

  return body.data;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers?.get('content-type') ?? 'application/json';

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as ApiResponse<T>;
    } catch {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: response.ok ? 'Empty response' : 'Request failed' },
      };
    }
  }

  return {
    success: false,
    error: { code: 'VALIDATION_ERROR', message: response.ok ? 'Empty response' : 'Request failed' },
  };
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function listContentTypes(): Promise<ContentTypeDto[]> {
  return request('/api/v1/content-types', { method: 'GET' });
}

export async function listContentProjects(): Promise<ContentProjectSummaryDto[]> {
  return request('/api/v1/content-projects', { method: 'GET' });
}

export async function createContentProject(
  requestBody: CreateContentProjectRequest,
): Promise<ContentProjectDetailDto> {
  return request('/api/v1/content-projects', jsonRequest('POST', requestBody));
}

export async function getContentProject(id: string): Promise<ContentProjectDetailDto> {
  return request(`/api/v1/content-projects/${id}`, { method: 'GET' });
}

export async function updateContentProject(
  id: string,
  requestBody: UpdateContentProjectRequest,
): Promise<ContentProjectDetailDto> {
  return request(`/api/v1/content-projects/${id}`, jsonRequest('PATCH', requestBody));
}

export async function deleteContentProject(id: string): Promise<DeleteContentProjectResponse> {
  return request(`/api/v1/content-projects/${id}`, { method: 'DELETE' });
}

export async function listPromptTemplates(): Promise<PromptTemplateSummaryDto[]> {
  return request('/api/v1/prompt-templates', { method: 'GET' });
}

export async function createPromptTemplate(
  requestBody: CreatePromptTemplateRequest,
): Promise<PromptTemplateDetailDto> {
  return request('/api/v1/prompt-templates', jsonRequest('POST', requestBody));
}

export async function getPromptTemplate(id: string): Promise<PromptTemplateDetailDto> {
  return request(`/api/v1/prompt-templates/${id}`, { method: 'GET' });
}

export async function getDefaultLlmProvider(): Promise<LlmProviderSafeDto | null> {
  return request('/api/v1/llm-providers/default', { method: 'GET' });
}

export async function saveDefaultLlmProvider(
  requestBody: SaveDefaultLlmProviderRequest,
): Promise<LlmProviderSafeDto> {
  return request('/api/v1/llm-providers/default', jsonRequest('PUT', requestBody));
}
