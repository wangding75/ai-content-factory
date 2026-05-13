import Joi from 'joi';

export const saveDefaultLlmProviderSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  model: Joi.string().trim().min(1).required(),
  baseUrl: Joi.string().trim().uri({ scheme: ['https'] }).optional(),
  apiKey: Joi.string().trim().min(1).required(),
  enabled: Joi.boolean().required(),
});
