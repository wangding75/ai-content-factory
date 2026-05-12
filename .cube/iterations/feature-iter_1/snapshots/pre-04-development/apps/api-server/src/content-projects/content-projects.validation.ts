import Joi from 'joi';

export const createContentProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  contentTypeId: Joi.string().trim().min(1).required(),
  targetPlatform: Joi.string().trim().min(1).required(),
  targetContentCount: Joi.number().integer().positive().required(),
  defaultGenerationParams: Joi.object().unknown(true).required(),
});

export const updateContentProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  targetPlatform: Joi.string().trim().min(1).required(),
  targetContentCount: Joi.number().integer().positive().required(),
  defaultGenerationParams: Joi.object().unknown(true).required(),
});
