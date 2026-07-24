import Joi from "joi";

const CATEGORY_TYPES = ["RAW", "FINISHED", "SEMI"];

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),

  typeId: Joi.string().length(24).hex().optional().messages({
    "string.length": "Invalid typeId",
    "string.hex": "Invalid typeId",
    "any.required": "TypeId is required",
  }),

  description: Joi.string().allow(null, "").max(500).optional().messages({
    "string.max": "Description must be less than 500 characters",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be true or false",
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "Name must be at least 2 characters",
  }),

  typeId: Joi.string().length(24).hex().optional().messages({
    "string.length": "Invalid categoryId",
    "string.hex": "Invalid categoryId",
  }),

  description: Joi.string().allow(null, "").max(500).optional().messages({
    "string.max": "Description must be less than 500 characters",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be true or false",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });
