import productTypeService from './productType.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';

const addNewProductType = async (req, res) => {
  try {
    const existing = await productTypeService.getProductTypes({
      name: req.body.name?.trim().toUpperCase(),
    });

    if (existing.length > 0) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PRODUCT_TYPE_ALREADY_EXISTS,
      );
    }

    const productType = await productTypeService.createProductType(req.body);

    if (!productType) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PRODUCT_TYPE_CREATE_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.PRODUCT_TYPE_CREATED,
      productType,
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

const getProductTypes = async (req, res) => {
  try {
    const productTypes = await productTypeService.getProductTypes();

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCT_TYPE_FETCHED,
      productTypes,
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

const getProductTypeById = async (req, res) => {
  try {
    const productType = await productTypeService.getProductTypeById(
      req.params.id,
    );

    if (!productType) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_TYPE_NOT_FOUND,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCT_TYPE_FETCHED,
      productType,
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

const updateProductType = async (req, res) => {
  try {
    const productType = await productTypeService.getProductTypeById(
      req.params.id,
    );

    if (!productType) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_TYPE_NOT_FOUND,
      );
    }

    const updated = await productTypeService.updateProductType(
      req.params.id,
      req.body,
    );

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCT_TYPE_UPDATED,
      updated,
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

const deleteProductType = async (req, res) => {
  try {
    const productType = await productTypeService.getProductTypeById(
      req.params.id,
    );

    if (!productType) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_TYPE_NOT_FOUND,
      );
    }

    await productTypeService.deleteProductType(req.params.id);

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCT_TYPE_DELETED,
      null,
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
  addNewProductType,
  getProductTypes,
  getProductTypeById,
  updateProductType,
  deleteProductType,
};