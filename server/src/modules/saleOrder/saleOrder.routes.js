import { Router } from "express";
import saleOrderController from "./saleOrder.controller.js";
import { validateSchema } from "../../middlewares/schemaValidate.js";
import { createSaleOrderSchema } from "./saleOrder.validation.js";
import authorization from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authorization,
  validateSchema(createSaleOrderSchema),
  saleOrderController.addNewSaleOrder,
);

router.get("/", authorization, saleOrderController.listAllSaleOrders);

export default router;
