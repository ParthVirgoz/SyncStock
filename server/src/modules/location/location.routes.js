import { Router } from 'express';
import locationController from './location.controller.js';
import { validateSchema } from './../../middlewares/schemaValidate.js';
import {
  createLocationSchema,
  updateLocationSchema,
} from './location.validation.js';
import authorization from '../../middlewares/auth.middleware.js';
const router = Router();

router.post(
  '/',
  authorization, 
  validateSchema(createLocationSchema),
  locationController.addNewLocation,
);

router.get('/', authorization, locationController.listAllLocations);

router.put(
  '/:id',
  authorization, 
  validateSchema(updateLocationSchema),
  locationController.updateLocation,
);

export default router;
