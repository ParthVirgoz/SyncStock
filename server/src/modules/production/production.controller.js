import productionService from './production.service.js';
import productService from '../product/product.service.js';
import locationService from '../location/location.service.js';
import inventoryService from '../inventory/inventory.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';

const addNewProduction = async (req, res) => {
  try {
    const payload = req.body;
    const product = await productService.getProductById(payload.productId);
    if (!product) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_NOT_FOUND,
      );
    }

    if (payload.materialsUsed) {
      for (const material of payload.materialsUsed) {
        const result = await productService.getProductById(material.productId);

        if (!result) {
          return errorResponse(
            req,
            res,
            httpStatus.NOT_FOUND,
            MESSAGES.ERROR.PRODUCT_NOT_FOUND,
          );
        }

        const location = await locationService.getLocationById(
          material.locationId,
        );

        if (!location) {
          return errorResponse(
            req,
            res,
            httpStatus.NOT_FOUND,
            MESSAGES.ERROR.LOCATION_NOT_FOUND,
          );
        }

        const inventory = await inventoryService.getExistingInventory(
          result._id,
          location._id,
        );

        if (!inventory) {
          return errorResponse(
            req,
            res,
            httpStatus.BAD_REQUEST,
            MESSAGES.ERROR.INVENTORY_NOT_FOUND(result.name),
          );
        }

        if (inventory.quantity < material.quantity) {
          return errorResponse(
            req,
            res,
            httpStatus.BAD_REQUEST,
            MESSAGES.ERROR.INSUFFICIENT_QUANTITY(result.name),
          );
        }

        await inventoryService.updateQuantity(
          result._id,
          location._id,
          -material.quantity,
        );
      }
    }

    const production = await productionService.addNewProduction(payload);

    if (!production) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PRODUCTION_ADD_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.PRODUCTION_ADDED,
      production,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      req,
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
};

const getAllProductions = async (req, res) => {
  try {
    const productions = await productionService.getAllProductions();

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCTION_LIST,
      productions,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      req,
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
};

const startProduction = async (req, res) => {
  try {
    const production = await productionService.getProductionById(req.params.id);

    if (!production) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCTION_NOT_FOUND,
      );
    }

    if (['IN_PROGRESS', 'COMPLETED'].includes(production.status)) {
      return errorResponse(
        req,
        res,
        httpStatus.BAD_REQUEST,
        MESSAGES.ERROR.PRODUCTION_ALREADY_START(production.status),
      );
    }

    const startedProduction = await productionService.makeProductionStart(
      req.params.id,
    );

    if (!startedProduction) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PRODUCTION_START_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCTION_START,
      startedProduction,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      req,
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
};

const completeProduction = async (req, res) => {
  try {
    const production = await productionService.getProductionById(req.params.id);
    const payload = req.body;

    if (!production) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCTION_NOT_FOUND,
      );
    }

    if (production.status === 'PENDING') {
      return errorResponse(
        req,
        res,
        httpStatus.BAD_REQUEST,
        MESSAGES.ERROR.PRODUCTION_NOT_STARTED,
      );
    }

    if (production.status === 'COMPLETED') {
      return errorResponse(
        req,
        res,
        httpStatus.BAD_REQUEST,
        MESSAGES.ERROR.PRODUCTION_ALREADY_COMPLETE,
      );
    }

    if (payload.materialsUsed) {
      await Promise.all(
        payload.materialsUsed.map(async (material) => {
          const result = await productService.getProductById(
            material.productId,
          );
          if (!result) {
            return errorResponse(
              req,
              res,
              httpStatus.NOT_FOUND,
              MESSAGES.ERROR.PRODUCT_NOT_FOUND,
            );
          }
          const inventory = await inventoryService.getExistingInventory(
            result._id,
            result.locationId,
          );

          if (!inventory) {
            return errorResponse(
              req,
              res,
              httpStatus.BAD_REQUEST,
              MESSAGES.ERROR.INVENTORY_NOT_FOUND(result.name),
            );
          }

          await inventoryService.updateQuantity(
            result._id,
            inventory.locationId,
            -material.quantity,
          );
        }),
      );
    }

    const completedProduction = await productionService.makeProductionComplete(
      req.params.id,
      payload,
    );

    const location = await locationService.getLocationById(payload.locationId);

    if (!location) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.LOCATION_NOT_FOUND,
      );
    }

    const inventory = await inventoryService.getExistingInventory(
      completedProduction,
      payload.locationId,
    );

    if (inventory) {
      await inventoryService.updateQuantity(
        inventory.productId,
        inventory.locationId,
        completedProduction.quantity,
      );
    } else {
      await inventoryService.addInventory({
        productId: completedProduction.productId,
        locationId: payload.locationId,
        quantity:
          completedProduction.quantityToProduce - (payload?.wastage || 0),
      });
    }

    if (!completedProduction) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PRODUCTION_COMPLETE_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCTION_COMPLETE,
      completedProduction,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      req,
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
};

export default {
  addNewProduction,
  getAllProductions,
  startProduction,
  completeProduction,
};
