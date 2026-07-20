import Joi from 'joi';

export const createSaleOrderSchema = Joi.object({
  customerName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Customer name is required',
    'string.min': 'Customer name must be at least 2 characters',
    'any.required': 'Customer name is required',
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
        
        locationId: Joi.string().length(24).hex().required().messages({
          'string.empty': 'locationId is required of each product.',
          'string.length': 'Invalid this product locationId',
          'string.hex': 'Invalid this product locationId',
          'any.required': 'locationId is required of each product.',
        }),

        quantity: Joi.number().min(0).required().messages({
          'number.base': 'quantity must be a number',
          'number.min': 'quantity cannot be negative',
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
});
