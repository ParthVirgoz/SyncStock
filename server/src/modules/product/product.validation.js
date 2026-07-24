import Joi from "joi";


export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),

  unit: Joi.string()
    .required()
    .messages({
      "any.only": "Unit must be kg, pcs or liters",
      "any.required": "Unit is required",
    }),

  sku: Joi.string().trim().required().messages({
    "string.empty": "SKU is required",
    "any.required": "SKU is required",
  }),

  categoryId: Joi.string().length(24).hex().optional().messages({
    "string.length": "Invalid categoryId",
    "string.hex": "Invalid categoryId",
  }),

  minStockLevel: Joi.number().min(0).required().messages({
    "number.base": "minStockLevel must be a number",
    "number.min": "minStockLevel cannot be negative",
    "any.required": "minStockLevel is required",
  }),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "Name must be at least 2 characters",
  }),

  unit: Joi.string()
    .optional()
    .messages({
      "any.only": "Unit must be kg, pcs or liters",
    }),

  sku: Joi.string().trim().optional().messages({
    "string.empty": "SKU cannot be empty",
  }),

  categoryId: Joi.string().length(24).hex().optional().messages({
    "string.length": "Invalid categoryId",
    "string.hex": "Invalid categoryId",
  }),

  minStockLevel: Joi.number().min(0).optional().messages({
    "number.base": "minStockLevel must be a number",
    "number.min": "minStockLevel cannot be negative",
  }),
})
  // .min(1)
  // .messages({
  //   "object.min": "At least one field is required to update",
  // });
