import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql'] }).required(),
  PORT: Joi.number().default(3000),
  LOG_LEVEL: Joi.string().default('info'),
  LLM_PROVIDER_API_KEY: Joi.string().allow('').optional(),
});
