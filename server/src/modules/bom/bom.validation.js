import Joi from 'joi';

export const createBomSchema = Joi.object({
  productId: Joi.string().length(24).hex().required().messages({
    'string.empty': 'productId is required',
    'string.length': 'Invalid productId',
    'string.hex': 'Invalid productId',
    'any.required': 'productId is required',
  }),

  materials: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'material productId is required',
          'string.length': 'Invalid material productId',
          'string.hex': 'Invalid material productId',
          'any.required': 'material productId is required',
        }),

        quantity: Joi.number().min(0).required().messages({
          'number.base': 'material quantity must be a number',
          'number.min': 'material quantity cannot be negative',
          'any.required': 'material quantity is required',
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one material is required',
      'any.required': 'materials are required',
    }),
});

export const updateBomSchema = Joi.object({
  productId: Joi.string().length(24).hex().optional().messages({
    'string.length': 'Invalid productId',
    'string.hex': 'Invalid productId',
  }),

  materials: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().length(24).hex().optional().messages({
          'string.length': 'Invalid material _id',
          'string.hex': 'Invalid material _id',
        }),

        productId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'material productId is required',
          'string.length': 'Invalid material productId',
          'string.hex': 'Invalid material productId',
          'any.required': 'material productId is required',
        }),

        quantity: Joi.number().min(0).required().messages({
          'number.base': 'material quantity must be a number',
          'number.min': 'material quantity cannot be negative',
          'any.required': 'material quantity is required',
        }),
      }),
    )
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one material is required',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required to update',
  });
