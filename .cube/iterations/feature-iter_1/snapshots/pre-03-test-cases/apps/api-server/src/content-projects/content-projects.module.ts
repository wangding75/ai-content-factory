import { Module } from '@nestjs/common';
import { ContentTypesModule } from '../content-types/content-types.module';
import { ContentProjectsController } from './content-projects.controller';
import { ContentProjectsService } from './content-projects.service';

@Module({
  imports: [ContentTypesModule],
  controllers: [ContentProjectsController],
  providers: [ContentProjectsService],
})
export class ContentProjectsModule {}
