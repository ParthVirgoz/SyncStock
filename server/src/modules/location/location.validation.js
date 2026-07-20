import Joi from 'joi';

const LOCATION_TYPES = ['WAREHOUSE', 'FACTORY', 'STORE'];

export const createLocationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),

  type: Joi.string().valid(...LOCATION_TYPES).required().messages({
    'any.only': 'Type must be WAREHOUSE, FACTORY or STORE',
    'any.required': 'Type is required',
  }),

  address: Joi.object({
    line1: Joi.string().required().messages({
      'string.empty': 'Address line1 is required',
      'any.required': 'Address line1 is required',
    }),

    city: Joi.string().required().messages({
      'string.empty': 'City is required',
      'any.required': 'City is required',
    }),

    state: Joi.string().required().messages({
      'string.empty': 'State is required',
      'any.required': 'State is required',
    }),

    country: Joi.string().required().messages({
      'string.empty': 'Country is required',
      'any.required': 'Country is required',
    }),

    pincode: Joi.string().required().messages({
      'string.empty': 'Pincode is required',
      'any.required': 'Pincode is required',
    }),
  }).required().messages({
    'any.required': 'Address is required',
  }),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be true or false',
  }),
});

export const updateLocationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
  }),

  type: Joi.string().valid(...LOCATION_TYPES).optional().messages({
    'any.only': 'Type must be WAREHOUSE, FACTORY or STORE',
  }),

  address: Joi.object({
    line1: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    pincode: Joi.string().optional(),
  }).optional(),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be true or false',
  }),
})
.min(1)
.messages({
  'object.min': 'At least one field is required to update',
});