import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validationSchema } from './config/configuration';
import { ContentProjectsModule } from './content-projects/content-projects.module';
import { ContentTypesModule } from './content-types/content-types.module';
import { HealthModule } from './health/health.module';
import { LlmProvidersModule } from './llm-providers/llm-providers.module';
import { PrismaModule } from './prisma/prisma.module';
import { PromptTemplatesModule } from './prompt-templates/prompt-templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>('LOG_LEVEL', 'info'),
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.headers["x-api-key"]',
              'res.headers["set-cookie"]',
            ],
            remove: true,
          },
        },
        renameContext: 'module',
      }),
    }),
    PrismaModule,
    HealthModule,
    ContentTypesModule,
    ContentProjectsModule,
    PromptTemplatesModule,
    LlmProvidersModule,
  ],
})
export class AppModule {}
