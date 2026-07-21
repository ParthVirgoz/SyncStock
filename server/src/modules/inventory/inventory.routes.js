import { Router } from 'express';
import inventoryController from './inventory.controller.js';
import { validateSchema } from './../../middlewares/schemaValidate.js';
import { createInventorySchema } from './inventory.validation.js';
import authorization from '../../middlewares/auth.middleware.js';
const router = Router();

router.post(
  '/',
  authorization, 
  validateSchema(createInventorySchema),
  inventoryController.adjustInventory,
);

router.get('/',authorization,  inventoryController.listInventory);

export default router;
