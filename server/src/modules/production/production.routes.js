import { Router } from 'express';
import productionController from './production.controller.js';
import { validateSchema } from '../../middlewares/schemaValidate.js';
import {
  completeProductionSchema,
  createProductionSchema,
} from './production.validation.js';
const router = Router();

router.post(
  '/',
  validateSchema(createProductionSchema),
  productionController.addNewProduction,
);

router.get('/', productionController.getAllProductions);

router.post('/:id/start', productionController.startProduction);

router.post(
  '/:id/complete',
  validateSchema(completeProductionSchema),
  productionController.completeProduction,
);

export default router;
