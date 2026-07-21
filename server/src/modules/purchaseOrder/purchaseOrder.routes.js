import { Router } from "express";
import purchaseOrderController from "./purchaseOrder.controller.js";
import { validateSchema } from "../../middlewares/schemaValidate.js";
import {
  createPurchaseOrderSchema,
  receivePurchaseOrder,
} from "./purchaseOrder.validation.js";
import authorization from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authorization,
  validateSchema(createPurchaseOrderSchema),
  purchaseOrderController.addNewPurchaseOrder,
);

router.get("/", authorization, purchaseOrderController.listAllPurchaseOrder);

router.post(
  "/:id/receive",
  authorization,
  validateSchema(receivePurchaseOrder),
  purchaseOrderController.receivePurchaseOrder,
);

export default router;
