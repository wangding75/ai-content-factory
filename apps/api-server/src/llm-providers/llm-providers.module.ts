import { Module } from '@nestjs/common';
import { LlmProvidersController } from './llm-providers.controller';
import { LlmProvidersService } from './llm-providers.service';

@Module({
  controllers: [LlmProvidersController],
  providers: [LlmProvidersService],
})
export class LlmProvidersModule {}
