import type { ApiErrorCode, ContentTypeDto } from '@ai-content-factory/shared';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ContentTypesPrisma = PrismaService & {
  contentType: {
    findMany(args: { where: { enabled: boolean } }): Promise<ContentTypeDto[]>;
    findUnique(args: { where: { id: string } }): Promise<ContentTypeDto | null>;
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

@Injectable()
export class ContentTypesService {
  constructor(private readonly prisma: ContentTypesPrisma) {}

  async listEnabledContentTypes(): Promise<ContentTypeDto[]> {
    try {
      return await this.prisma.contentType.findMany({ where: { enabled: true } });
    } catch {
      throw apiError('CONTENT_TYPES_LOAD_FAILED', 'Failed to load content types');
    }
  }

  async ensureEnabledContentType(contentTypeId: string): Promise<ContentTypeDto> {
    const contentType = await this.prisma.contentType.findUnique({ where: { id: contentTypeId } });

    if (!contentType?.enabled) {
      throw apiError('CONTENT_TYPE_NOT_AVAILABLE', 'Content type is not available');
    }

    return contentType;
  }
}
