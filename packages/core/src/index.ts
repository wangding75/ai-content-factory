export type ContentProjectStatus = 'draft' | 'active' | 'archived';

export interface ContentProjectEntity {
  id: string;
  name: string;
  contentTypeId: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
  status: ContentProjectStatus;
}
