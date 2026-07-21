import { Router } from "express";
import productionController from "./production.controller.js";
import { validateSchema } from "../../middlewares/schemaValidate.js";
import {
  completeProductionSchema,
  createProductionSchema,
} from "./production.validation.js";
import authorization from "../../middlewares/auth.middleware.js";
const router = Router();

router.post(
  "/",
  authorization,
  validateSchema(createProductionSchema),
  productionController.addNewProduction,
);

router.get("/", authorization, productionController.getAllProductions);

router.post("/:id/start", authorization, productionController.startProduction);

router.post(
  "/:id/complete",
  authorization,
  validateSchema(completeProductionSchema),
  productionController.completeProduction,
);

export default router;
