import { Router } from 'express';
import categoryController from './category.controller.js';
import { validateSchema } from './../../middlewares/schemaValidate.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from './category.validation.js';
const router = Router();

router.post(
  '/',
  validateSchema(createCategorySchema),
  categoryController.addNewCategory,
);

router.get('/', categoryController.listCategories);

router.put(
  '/:id',
  validateSchema(updateCategorySchema),
  categoryController.updateCategory,
);

export default router;
