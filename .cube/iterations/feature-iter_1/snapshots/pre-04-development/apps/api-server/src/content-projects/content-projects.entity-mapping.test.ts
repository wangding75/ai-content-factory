import { describe, expect, it } from 'vitest';

interface PrismaContentProjectRecord {
  id: string;
  name: string;
  contentTypeId: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  contentType: { id: string; name: string; packId: string; enabled: boolean };
}

import { ContentProjectsService } from './content-projects.service';
import { ContentTypesService } from '../content-types/content-types.service';

describe('ContentProjectEntity mapping (Task-03)', () => {
  it('maps a Prisma-like project record into the core ContentProjectEntity contract', () => {
    const service = new ContentProjectsService({} as ContentTypesService);
    const project: PrismaContentProjectRecord = {
      id: 'project_1',
      name: 'Evergreen Content Plan',
      contentTypeId: 'novel',
      targetPlatform: 'web',
      targetContentCount: 12,
      defaultGenerationParams: { tone: 'warm', maxTokens: 1200 },
      status: 'draft',
      createdAt: new Date('2026-05-11T00:00:00.000Z'),
      updatedAt: new Date('2026-05-11T01:00:00.000Z'),
      contentType: { id: 'novel', name: 'Novel', packId: 'novel-pack', enabled: true },
    };

    expect(service.toEntity(project)).toEqual({
      id: 'project_1',
      name: 'Evergreen Content Plan',
      contentTypeId: 'novel',
      targetPlatform: 'web',
      targetContentCount: 12,
      defaultGenerationParams: { tone: 'warm', maxTokens: 1200 },
      status: 'draft',
    });
  });

  it('does not leak Prisma relation or timestamp fields into the core entity', () => {
    const service = new ContentProjectsService({} as ContentTypesService);
    const project: PrismaContentProjectRecord = {
      id: 'project_1',
      name: 'Evergreen Content Plan',
      contentTypeId: 'novel',
      targetPlatform: 'web',
      targetContentCount: 12,
      defaultGenerationParams: {},
      status: 'draft',
      createdAt: new Date('2026-05-11T00:00:00.000Z'),
      updatedAt: new Date('2026-05-11T01:00:00.000Z'),
      contentType: { id: 'novel', name: 'Novel', packId: 'novel-pack', enabled: true },
    };
    const entity = service.toEntity(project);

    expect(entity).not.toHaveProperty('contentType');
    expect(entity).not.toHaveProperty('createdAt');
    expect(entity).not.toHaveProperty('updatedAt');
  });
});
