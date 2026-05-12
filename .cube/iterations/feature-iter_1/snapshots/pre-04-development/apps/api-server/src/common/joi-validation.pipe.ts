import type { PipeTransform } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: unknown): unknown {
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            issues: error.details.map((detail) => detail.message),
          },
        },
      });
    }

    return validatedValue;
  }
}
