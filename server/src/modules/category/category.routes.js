import { Router } from "express";
import categoryController from "./category.controller.js";
import { validateSchema } from "./../../middlewares/schemaValidate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import authorization from "../../middlewares/auth.middleware.js";
const router = Router();

router.post(
  "/",
  authorization,
  validateSchema(createCategorySchema),
  categoryController.addNewCategory,
);

router.get("/", authorization, categoryController.listCategories);

router.put(
  "/:id",
  authorization,

  validateSchema(updateCategorySchema),
  categoryController.updateCategory,
);

export default router;
