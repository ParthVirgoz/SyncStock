import { Router } from "express";
import { loginSchema } from "./auth.validation.js";
import { validateSchema } from "./../../middlewares/schemaValidate.js";
import authController from "./auth.controller.js";
const router = Router();

router.post("/login", validateSchema(loginSchema), authController.login);

export default router;
