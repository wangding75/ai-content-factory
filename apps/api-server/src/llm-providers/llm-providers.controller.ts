import type {
  ApiSuccessResponse,
  LlmProviderSafeDto,
  SaveDefaultLlmProviderRequest,
} from '@ai-content-factory/shared';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { JoiValidationPipe } from '../common/joi-validation.pipe';
import { LlmProvidersService } from './llm-providers.service';
import { saveDefaultLlmProviderSchema } from './llm-providers.validation';

@Controller('/api/v1/llm-providers')
export class LlmProvidersController {
  constructor(private readonly llmProvidersService: LlmProvidersService) {}

  @Get('/default')
  async getDefaultProvider(): Promise<ApiSuccessResponse<LlmProviderSafeDto | null>> {
    const data = await this.llmProvidersService.getDefaultProvider();

    return { success: true, data, message: 'OK' };
  }

  @Put('/default')
  async saveDefaultProvider(
    @Body(new JoiValidationPipe(saveDefaultLlmProviderSchema)) request: SaveDefaultLlmProviderRequest,
  ): Promise<ApiSuccessResponse<LlmProviderSafeDto>> {
    const data = await this.llmProvidersService.saveDefaultProvider(request);

    return { success: true, data, message: 'OK' };
  }
}
