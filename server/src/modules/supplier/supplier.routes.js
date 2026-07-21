import { Router } from "express";
import supplierController from "./supplier.controller.js";
import { validateSchema } from "../../middlewares/schemaValidate.js";
import { createSupplierSchema } from "./supplier.validation.js";
import authorization from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authorization,
  validateSchema(createSupplierSchema),
  supplierController.addNewSupplier,
);

router.get("/", authorization, supplierController.listAllSupplier);

router.put("/:id", authorization, supplierController.updateSupplier);

export default router;
