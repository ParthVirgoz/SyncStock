import Joi from 'joi';

export const createProductTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),

  description: Joi.string().trim().allow('').max(255).optional(),

  isActive: Joi.boolean().optional(),
});

export const updateProductTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional().messages({
    'string.min': 'Name must be at least 2 characters',
  }),

  description: Joi.string().trim().allow('').max(255).optional(),

  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required to update',
  });