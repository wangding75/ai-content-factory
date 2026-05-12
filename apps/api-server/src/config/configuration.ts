import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().default(process.env.NODE_ENV ?? 'development'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql'] }).required(),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),
  LLM_PROVIDER_API_KEY: Joi.string().allow('').optional(),
  LLM_PROVIDER_API_KEY_ENCRYPTION_KEY: Joi.when('NODE_ENV', {
    is: 'test',
    then: Joi.string().min(32).optional(),
    otherwise: Joi.string().min(32).required(),
  }),
});
