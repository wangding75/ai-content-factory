import type { ContentProjectStatus } from '@ai-content-factory/shared';

export interface ContentProjectEntity {
  id: string;
  name: string;
  contentTypeId: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
  status: ContentProjectStatus;
}
