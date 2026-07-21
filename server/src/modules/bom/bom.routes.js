import { Router } from "express";
import bomController from "./bom.controller.js";
import { validateSchema } from "./../../middlewares/schemaValidate.js";
import { createBomSchema, updateBomSchema } from "./bom.validation.js";
import authorization from "../../middlewares/auth.middleware.js";
const router = Router();

router.post(
  "/",
  authorization,
  validateSchema(createBomSchema),
  bomController.addBOM,
);

router.get("/:productId", authorization, bomController.getBOMByProduct);

router.put(
  "/:id",
  authorization,
  validateSchema(updateBomSchema),
  bomController.updateBOM,
);

export default router;
