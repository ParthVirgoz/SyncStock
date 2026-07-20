import Joi from 'joi';

const STATUS = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export const createProductionSchema = Joi.object({
  productId: Joi.string().length(24).hex().required().messages({
    'string.empty': 'productId is required',
    'string.length': 'Invalid productId',
    'string.hex': 'Invalid productId',
    'any.required': 'productId is required',
  }),

  quantityToProduce: Joi.number().min(0).required().messages({
    'number.base': 'quantityToProduce must be a number',
    'number.min': 'quantityToProduce cannot be negative',
    'any.required': 'quantityToProduce is required',
  }),

  status: Joi.string()
    .valid(...STATUS)
    .optional()
    .messages({
      'any.only': 'Status must be PENDING, IN_PROGRESS or COMPLETED',
    }),

  materialsUsed: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'material productId is required',
          'string.length': 'Invalid material productId',
          'string.hex': 'Invalid material productId',
          'any.required': 'material productId is required',
        }),

        locationId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'material locationId is required',
          'string.length': 'Invalid material locationId',
          'string.hex': 'Invalid material locationId',
          'any.required': 'material locationId is required',
        }),

        quantity: Joi.number().min(0).required().messages({
          'number.base': 'material quantity must be a number',
          'number.min': 'material quantity cannot be negative',
          'any.required': 'material quantity is required',
        }),
      }),
    )
    .optional(),

  wastage: Joi.number().min(0).optional().messages({
    'number.base': 'wastage must be a number',
    'number.min': 'wastage cannot be negative',
  }),
});

export const completeProductionSchema = Joi.object({
  locationId: Joi.string().length(24).hex().required().messages({
    'string.empty': 'this product locationId is required',
    'string.length': 'Invalid this product locationId',
    'string.hex': 'Invalid this product locationId',
    'any.required': 'this product locationId is required',
  }),

  materialsUsed: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'material productId is required',
          'string.length': 'Invalid material productId',
          'string.hex': 'Invalid material productId',
          'any.required': 'material productId is required',
        }),

        locationId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'material locationId is required',
          'string.length': 'Invalid material locationId',
          'string.hex': 'Invalid material locationId',
          'any.required': 'material locationId is required',
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
      'any.required': 'materialsUsed is required',
    }),

  wastage: Joi.number().min(0).optional().messages({
    'number.base': 'wastage must be a number',
    'number.min': 'wastage cannot be negative',
  }),
});
