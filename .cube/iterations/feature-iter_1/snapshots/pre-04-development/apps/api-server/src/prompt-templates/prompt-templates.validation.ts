import Joi from 'joi';

export const createPromptTemplateSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  contentTypeId: Joi.string().trim().min(1).required(),
  purpose: Joi.string().trim().min(1).required(),
  content: Joi.string().trim().min(1).required(),
  version: Joi.string().trim().min(1).required(),
});
