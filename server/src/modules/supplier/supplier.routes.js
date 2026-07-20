import { Router } from 'express';
import supplierController from './supplier.controller.js';
import { validateSchema } from '../../middlewares/schemaValidate.js';
import { createSupplierSchema } from './supplier.validation.js';

const router = Router();

router.post(
  '/',
  validateSchema(createSupplierSchema),
  supplierController.addNewSupplier,
);

router.get('/', supplierController.listAllSupplier);

router.put('/:id', supplierController.updateSupplier);

export default router;

