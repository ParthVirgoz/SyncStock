import inventoryService from './inventory.service.js';
import productService from '../product/product.service.js';
import locationService from '../location/location.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';

const adjustInventory = async (req, res) => {
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

    const location = await locationService.getLocationById(payload.locationId);
    if (!location) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.LOCATION_NOT_FOUND,
      );
    }

    const inventoryExist = await inventoryService.getExistingInventory(
      payload.productId,
      payload.locationId,
    );

    if (inventoryExist) {
      const updateQuantity = await inventoryService.updateQuantity(
        payload.productId,
        payload.locationId,
        payload.quantity,
      );
      if (!updateQuantity) {
        return errorResponse(
          req,
          res,
          httpStatus.CONFLICT,
          MESSAGES.ERROR.INVENTORY_ADJUST_FAILED,
        );
      }
      return successResponse(
        req,
        res,
        httpStatus.CREATED,
        MESSAGES.SUCCESS.INVENTORY_ADJUSTED,
        updateQuantity,
      );
    }

    const inventory = await inventoryService.addInventory(payload);

    if (!inventory) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.INVENTORY_ADJUST_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.INVENTORY_ADJUSTED,
      inventory,
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

const listInventory = async (req, res) => {
  try {
    const inventories = await inventoryService.listInventory();

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.INVENTORY_LIST,
      inventories
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
  adjustInventory,
  listInventory,
};
