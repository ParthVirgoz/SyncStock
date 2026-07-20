import Joi from 'joi';

const CATEGORY_TYPES = ['RAW', 'FINISHED', 'SEMI'];

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),

  type: Joi.string().valid(...CATEGORY_TYPES).required().messages({
    'any.only': 'Type must be RAW, FINISHED or SEMI',
    'any.required': 'Type is required',
  }),

  description: Joi.string().allow(null, '').max(500).optional().messages({
    'string.max': 'Description must be less than 500 characters',
  }),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be true or false',
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
  }),

  type: Joi.string().valid(...CATEGORY_TYPES).optional().messages({
    'any.only': 'Type must be RAW, FINISHED or SEMI',
  }),

  description: Joi.string().allow(null, '').max(500).optional().messages({
    'string.max': 'Description must be less than 500 characters',
  }),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be true or false',
  }),
})
.min(1)
.messages({
  'object.min': 'At least one field is required to update',
});