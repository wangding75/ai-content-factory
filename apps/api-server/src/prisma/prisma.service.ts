import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    throw new Error('not implemented');
  }

  async onModuleDestroy(): Promise<void> {
    throw new Error('not implemented');
  }
}
