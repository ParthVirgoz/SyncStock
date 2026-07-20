import supplierService from './supplier.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';

const addNewSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.addSupplier(req.body);
    if (!supplier) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.SUPPLIER_ADD_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.SUPPLIER_ADDED,
      supplier,
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

const listAllSupplier = async (req, res) => {
  try {
    const suppliers = await supplierService.listAllSupplier();

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.SUPPLIER_LIST,
      suppliers,
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

const updateSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);

    if (!supplier) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.SUPPLIER_NOT_FOUND,
      );
    }

    const updatedSupplier = await supplierService.updateSupplier(
      req.params.id,
      req.body,
    );

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.SUPPLIER_UPDATED,
      updatedSupplier,
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
  addNewSupplier,
  listAllSupplier,
  updateSupplier,
};
