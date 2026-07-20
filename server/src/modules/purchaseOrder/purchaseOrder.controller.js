import purchaseOrderService from './purchaseOrder.service.js';
import supplierService from '../supplier/supplier.service.js';
import inventoryService from '../inventory/inventory.service.js';
import locationService from '../location/location.service.js';
import productService from '../product/product.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';

const addNewPurchaseOrder = async (req, res) => {
  try {
    const payload = req.body;

    const supplier = await supplierService.getSupplierById(payload.supplierId);

    if (!supplier) {
      errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.SUPPLIER_NOT_FOUND,
      );
    }

    await Promise.all([
      payload.items.map(async (item) => {
        const result = await productService.getProductById(item.productId);
        if (!result) {
          return errorResponse(
            req,
            res,
            httpStatus.NOT_FOUND,
            MESSAGES.ERROR.PRODUCT_NOT_FOUND,
          );
        }
      }),
    ]);

    const purchaseOrder = await purchaseOrderService.createPurchase(payload);

    if (!purchaseOrder) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PURCHASE_ADDED_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.PURCHASE_ADDED,
      purchaseOrder,
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

const listAllPurchaseOrder = async (req, res) => {
  try {
    const purchases = await purchaseOrderService.listPurchases();

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PURCHASE_LIST,
      purchases,
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

const receivePurchaseOrder = async (req, res) => {
  try {
    const payload = req.body;
    const purchaseOrder = await purchaseOrderService.getPurchaseById(
      req.params.id,
    );

    if (!purchaseOrder) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PURCHASE_NOT_FOUND,
      );
    }

    if (purchaseOrder.status === 'RECEIVED') {
      return errorResponse(
        req,
        res,
        httpStatus.BAD_REQUEST,
        MESSAGES.ERROR.PURCHASE_ALREADY_RECEIVE,
      );
    }

    const receivePurchaseOrder = await purchaseOrderService.makePurchaseReceive(
      req.params.id,
    );

    if (!receivePurchaseOrder) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PURCHASE_RECEIVE_FAILED,
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

    for (const item of receivePurchaseOrder.items) {
      const inventory = await inventoryService.getExistingInventory(
        item.productId,
        payload.locationId,
      );

      if (inventory) {
        await inventoryService.updateQuantity(
          item.productId,
          payload.locationId,
          item.quantity,
        );
      } else {
        await inventoryService.addInventory({
          productId: item.productId,
          locationId: payload.locationId,
          quantity: item.quantity,
        });
      }
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PURCHASE_RECEIVED,
      receivePurchaseOrder,
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
  addNewPurchaseOrder,
  listAllPurchaseOrder,
  receivePurchaseOrder,
};
