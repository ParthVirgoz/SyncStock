import Joi from 'joi';

export const createSupplierSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),

  contactNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.empty': 'Contact number is required',
    'string.pattern.base': 'Contact number must be 10 digits',
    'any.required': 'Contact number is required',
  }),

  address: Joi.string().trim().min(5).max(255).required().messages({
    'string.empty': 'Address is required',
    'string.min': 'Address must be at least 5 characters',
    'any.required': 'Address is required',
  }),
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
  }),

  contactNumber: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Contact number must be 10 digits',
  }),

  address: Joi.string().trim().min(5).max(255).optional().messages({
    'string.min': 'Address must be at least 5 characters',
  }),
})
.min(1)
.messages({
  'object.min': 'At least one field is required to update',
});