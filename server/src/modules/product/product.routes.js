import { Router } from "express";
import productController from "./product.controller.js";
import { validateSchema } from "./../../middlewares/schemaValidate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validation.js";
import authorization from "../../middlewares/auth.middleware.js";
import { upload } from "../../common/utils/upload.js";
const router = Router();

router.post(
  "/",
  authorization,
  upload.single("productImage"),
  validateSchema(createProductSchema),
  productController.addNewProduct,
);

router.get("/", authorization, productController.getProducts);

router.get("/:id", authorization, productController.getProductById);

router.put(
  "/:id",
  authorization,
  upload.single("productImage"),
  validateSchema(updateProductSchema),
  productController.updateProduct,
);

router.delete("/:id", authorization, productController.deleteProduct);

export default router;
