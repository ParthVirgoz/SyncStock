import { Router } from 'express';
import saleOrderController from './saleOrder.controller.js';
import { validateSchema } from '../../middlewares/schemaValidate.js';
import { createSaleOrderSchema } from './saleOrder.validation.js';

const router = Router();

router.post(
  '/',
  validateSchema(createSaleOrderSchema),
  saleOrderController.addNewSaleOrder,
);

router.get('/', saleOrderController.listAllSaleOrders);

export default router;
