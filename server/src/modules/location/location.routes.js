import { Router } from 'express';
import locationController from './location.controller.js';
import { validateSchema } from './../../middlewares/schemaValidate.js';
import {
  createLocationSchema,
  updateLocationSchema,
} from './location.validation.js';
const router = Router();

router.post(
  '/',
  validateSchema(createLocationSchema),
  locationController.addNewLocation,
);

router.get('/', locationController.listAllLocations);

router.put(
  '/:id',
  validateSchema(updateLocationSchema),
  locationController.updateLocation,
);

export default router;
