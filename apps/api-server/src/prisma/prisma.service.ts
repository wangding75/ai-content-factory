import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

type PrismaLifecycleClient = {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
};

type PrismaClientModule = {
  PrismaClient?: new () => PrismaLifecycleClient;
};

function createPrismaClient(): PrismaLifecycleClient | undefined {
  try {
    const { PrismaClient } = require('@prisma/client') as PrismaClientModule;
    return PrismaClient ? new PrismaClient() : undefined;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      return undefined;
    }
    throw error;
  }
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = createPrismaClient();

  async $connect(): Promise<void> {
    await this.client?.$connect();
  }

  async $disconnect(): Promise<void> {
    await this.client?.$disconnect();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
