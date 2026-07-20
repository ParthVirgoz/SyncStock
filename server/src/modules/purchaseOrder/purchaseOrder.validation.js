import Joi from 'joi';

const STATUS = ['PENDING', 'RECEIVED'];

export const createPurchaseOrderSchema = Joi.object({
  supplierId: Joi.string().length(24).hex().required().messages({
    'string.empty': 'supplierId is required',
    'string.length': 'Invalid supplierId',
    'string.hex': 'Invalid supplierId',
    'any.required': 'supplierId is required',
  }),

  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'productId is required',
          'string.length': 'Invalid productId',
          'string.hex': 'Invalid productId',
          'any.required': 'productId is required',
        }),

        quantity: Joi.number().min(1).required().messages({
          'number.base': 'quantity must be a number',
          'number.min': 'quantity must be at least 1',
          'any.required': 'quantity is required',
        }),

        price: Joi.number().min(0).required().messages({
          'number.base': 'price must be a number',
          'number.min': 'price cannot be negative',
          'any.required': 'price is required',
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'items are required',
    }),

  status: Joi.string()
    .valid(...STATUS)
    .optional()
    .messages({
      'any.only': 'Status must be PENDING or RECEIVED',
    }),
});

export const receivePurchaseOrder = Joi.object({
  locationId: Joi.string().length(24).hex().required().messages({
    'string.empty': 'this product locationId is required',
    'string.length': 'Invalid this product locationId',
    'string.hex': 'Invalid this product locationId',
    'any.required': 'this product locationId is required',
  }),
});