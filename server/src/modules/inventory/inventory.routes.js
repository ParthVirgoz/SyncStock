import { Router } from 'express';
import inventoryController from './inventory.controller.js';
import { validateSchema } from './../../middlewares/schemaValidate.js';
import { createInventorySchema } from './inventory.validation.js';
const router = Router();

router.post(
  '/',
  validateSchema(createInventorySchema),
  inventoryController.adjustInventory,
);

router.get('/', inventoryController.listInventory);

export default router;
