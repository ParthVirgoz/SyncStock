import Joi from 'joi';

export const createInventorySchema = Joi.object({
  productId: Joi.string().length(24).hex().required().messages({
    'string.empty': 'productId is required',
    'string.length': 'Invalid productId',
    'string.hex': 'Invalid productId',
    'any.required': 'productId is required',
  }),

  locationId: Joi.string().length(24).hex().required().messages({
    'string.empty': 'locationId is required',
    'string.length': 'Invalid locationId',
    'string.hex': 'Invalid locationId',
    'any.required': 'locationId is required',
  }),

  quantity: Joi.number().required().messages({
    'number.base': 'quantity must be a number',
    'any.required': 'quantity is required',
  }),

  reservedQuantity: Joi.number().min(0).optional().messages({
    'number.base': 'reservedQuantity must be a number',
    'number.min': 'reservedQuantity cannot be negative',
  }),
});
