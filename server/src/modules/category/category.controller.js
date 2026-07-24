import categoryService from "./category.service.js";
import productTypeService from "../productType/productType.service.js";
import httpStatus from "http-status";
import {
  errorResponse,
  successResponse,
} from "../../common/utils/apiResponse.js";
import { MESSAGES } from "../../common/constants/messages.js";

const addNewCategory = async (req, res) => {
  try {
    const productType = await productTypeService.getProductTypeById(
      req.body.typeId,
    );

    if (!productType) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_TYPE_NOT_FOUND,
      );
    }

    const category = await categoryService.addCategory(req.body);
    if (!category) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.CATEGORY_CREATE_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.CATEGORY_ADDED,
      category,
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

const listCategories = async (req, res) => {
  try {
    const { isActive } = req.query;

    const categories = await categoryService.listCategory(isActive);

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.CATEGORY_LIST,
      categories,
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

const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.CATEGORY_NOT_FOUND,
      );
    }

    if (req.body?.typeId) {
      const productType = await productTypeService.getProductTypeById(
        req.body.typeId,
      );

      if (!productType) {
        return errorResponse(
          req,
          res,
          httpStatus.NOT_FOUND,
          MESSAGES.ERROR.PRODUCT_TYPE_NOT_FOUND,
        );
      }
    }

    const updatedCategory = await categoryService.updateCategory(
      req.params.id,
      req.body,
    );

    if (!updatedCategory) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.CATEGORY_UPDATE_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.CATEGORY_UPDATED,
      updatedCategory,
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
  addNewCategory,
  listCategories,
  updateCategory,
};
