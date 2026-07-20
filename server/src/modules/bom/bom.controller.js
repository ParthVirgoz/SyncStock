import bomService from './bom.service.js';
import productService from '../product/product.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';
import { log } from 'console';

const addBOM = async (req, res) => {
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

    await Promise.all(
      payload.materials.map(async (material) => {
        const result = await productService.getProductById(material.productId);
        if (!result) {
          return errorResponse(
            req,
            res,
            httpStatus.NOT_FOUND,
            MESSAGES.ERROR.PRODUCT_NOT_FOUND,
          );
        }
      }),
    );

    const BOM = await bomService.addBOM(payload);

    if (!BOM) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.BOM_ADD_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.BOM_ADDED,
      BOM,
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

const updateBOM = async (req, res) => {
  try {
    const payload = req.body;

    const bom = await bomService.getBOMById(req.params.id);
    if (!bom) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.BOM_NOT_FOUND,
      );
    }

    if (payload.productId) {
      if (bom.productId.toString() !== payload.productId) {
        const product = await productService.getProductById(payload.productId);
        if (!product) {
          return errorResponse(
            req,
            res,
            httpStatus.NOT_FOUND,
            MESSAGES.ERROR.PRODUCT_NOT_FOUND,
          );
        }
      }
    }

    if (payload.materials) {
      await Promise.all(
        payload.materials.map(async (material) => {
          const result = await productService.getProductById(
            material.productId,
          );
          if (!result) {
            throw new Error(MESSAGES.ERROR.PRODUCT_NOT_FOUND);
          }
        }),
      );
    }

    const BOM = await bomService.updateBOM(req.params.id, payload);

    if (!BOM) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.BOM_UPDATE_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.BOM_UPDATED,
      BOM,
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

const getBOMByProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_NOT_FOUND,
      );
    }

    const BOMs = await bomService.getBOMByProduct(req.params.productId);

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.BOM_LIST,
      BOMs,
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
  addBOM,
  updateBOM,
  getBOMByProduct,
};
