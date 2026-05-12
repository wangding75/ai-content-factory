import { Module } from '@nestjs/common';
import { ContentTypesModule } from '../content-types/content-types.module';
import { PromptTemplatesController } from './prompt-templates.controller';
import { PromptTemplatesService } from './prompt-templates.service';

@Module({
  imports: [ContentTypesModule],
  controllers: [PromptTemplatesController],
  providers: [PromptTemplatesService],
})
export class PromptTemplatesModule {}
