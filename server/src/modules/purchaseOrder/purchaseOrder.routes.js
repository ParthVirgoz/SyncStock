import { Router } from 'express';
import purchaseOrderController from './purchaseOrder.controller.js';
import { validateSchema } from '../../middlewares/schemaValidate.js';
import {
  createPurchaseOrderSchema,
  receivePurchaseOrder,
} from './purchaseOrder.validation.js';

const router = Router();

router.post(
  '/',
  validateSchema(createPurchaseOrderSchema),
  purchaseOrderController.addNewPurchaseOrder,
);

router.get('/', purchaseOrderController.listAllPurchaseOrder);

router.post(
  '/:id/receive',
  validateSchema(receivePurchaseOrder),
  purchaseOrderController.receivePurchaseOrder,
);

export default router;
