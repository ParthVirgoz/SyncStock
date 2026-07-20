import { Router } from 'express';
import bomController from './bom.controller.js';
import { validateSchema } from './../../middlewares/schemaValidate.js';
import { createBomSchema, updateBomSchema } from './bom.validation.js';
const router = Router();

router.post('/', validateSchema(createBomSchema), bomController.addBOM);

router.get('/:productId', bomController.getBOMByProduct);

router.put('/:id', validateSchema(updateBomSchema), bomController.updateBOM);

export default router;
