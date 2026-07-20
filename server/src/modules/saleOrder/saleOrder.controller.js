import saleOrderService from './saleOrder.service.js';
import productService from '../product/product.service.js';
import locationService from '../location/location.service.js';
import inventoryService from '../inventory/inventory.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';

const addNewSaleOrder = async (req, res) => {
  try {
    const payload = req.body;

    for (const item of payload.items) {
      const result = await productService.getProductById(item.productId);
      if (!result) {
        return errorResponse(
          req,
          res,
          httpStatus.NOT_FOUND,
          MESSAGES.ERROR.PRODUCT_NOT_FOUND,
        );
      }
      const inventory = await inventoryService.getExistingInventory(
        item.productId,
        item.locationId,
      );
      if (!inventory) {
        return errorResponse(
          req,
          res,
          httpStatus.BAD_REQUEST,
          MESSAGES.ERROR.INVENTORY_NOT_FOUND(result.name),
        );
      }

      if (inventory.quantity < item.quantity) {
        return errorResponse(
          req,
          res,
          httpStatus.BAD_REQUEST,
          MESSAGES.ERROR.INSUFFICIENT_QUANTITY(result.name),
        );
      }

      await inventoryService.updateQuantity(
        item.productId,
        item.locationId,
        -item.quantity,
      );
    }

    const saleOrder = await saleOrderService.addNewSalesOrder(payload);

    if (!saleOrder) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.SALE_ORDER_ADD_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.SALE_ORDER_ADD,
      saleOrder,
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

const listAllSaleOrders = async (req, res) => {
  try {
    const saleOrders = await saleOrderService.listSalesOrder();

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.SALE_ORDER_LIST,
      saleOrders,
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
  addNewSaleOrder,
  listAllSaleOrders,
};
