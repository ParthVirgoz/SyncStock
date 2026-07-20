import { Router } from 'express';
import productController from './product.controller.js';
import { validateSchema } from './../../middlewares/schemaValidate.js';
import { createProductSchema, updateProductSchema } from './product.validation.js';
const router = Router();

router.post(
  '/',
  validateSchema(createProductSchema),
  productController.addNewProduct,
);

router.get('/', productController.getProducts);

router.get('/:id', productController.getProductById);

router.put(
  '/:id',
  validateSchema(updateProductSchema),
  productController.updateProduct,
);

router.delete('/:id', productController.deleteProduct);

export default router;
