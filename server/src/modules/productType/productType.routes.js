import { Router } from "express";
import productTypeController from "./productType.controller.js";
import { validateSchema } from "./../../middlewares/schemaValidate.js";
import {
  createProductTypeSchema,
  updateProductTypeSchema,
} from "./productType.validation.js";
import authorization from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authorization,
  validateSchema(createProductTypeSchema),
  productTypeController.addNewProductType,
);

router.get("/", authorization, productTypeController.getProductTypes);

router.get("/:id", authorization, productTypeController.getProductTypeById);

router.put(
  "/:id",
  authorization,
  validateSchema(updateProductTypeSchema),
  productTypeController.updateProductType,
);

router.delete("/:id", authorization, productTypeController.deleteProductType);

export default router;
