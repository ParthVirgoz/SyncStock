import productService from "./product.service.js";
import categoryService from "../category/category.service.js";
import httpStatus from "http-status";
import {
  errorResponse,
  successResponse,
} from "../../common/utils/apiResponse.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { destroyFile } from "../../common/utils/upload.js";

const addNewProduct = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.body.categoryId);
    const productImage = req.file ? (req.file.location ?? req.file.path) : null;

    if (!category) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.CATEGORY_NOT_FOUND,
      );
    }

    if (!category.isActive) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.CATEGORY_INACTIVE,
      );
    }

    const product = await productService.createProduct({
      ...req.body,
      image: productImage,
      typeId: category.typeId,
    });

    if (!product) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.PRODUCT_CREATE_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.PRODUCT_CREATED,
      product,
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

const getProducts = async (req, res) => {
  try {
    const { page, limit, type, search } = req.query;

    const result = await productService.getAllProducts({
      page,
      limit,
      type,
      search,
    });

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCT_CREATED.replace("created", "retrieved"),
      result,
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

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_NOT_FOUND,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      "Product retrieved successfully.",
      product,
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

const updateProduct = async (req, res) => {
  try {
    const bodyData = req.body;
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_NOT_FOUND,
      );
    }
    if (bodyData?.categoryId) {
      const category = await categoryService.getCategoryById(
        req.body.categoryId,
      );

      if (!category) {
        return errorResponse(
          req,
          res,
          httpStatus.NOT_FOUND,
          MESSAGES.ERROR.CATEGORY_NOT_FOUND,
        );
      }
      bodyData.typeId = category.typeId;
    }

    const productImage = req.file ? (req.file.location ?? req.file.path) : null;

    if (productImage) {
      if (product.image) {
        await destroyFile(product.image);
      }
      bodyData.image = productImage;
    }

    const updatedProduct = await productService.updateProduct(
      req.params.id,
      bodyData,
    );

    if (!updatedProduct) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_NOT_FOUND,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      "Product updated successfully.",
      updatedProduct,
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

const deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);

    if (!product) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.PRODUCT_NOT_FOUND,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.PRODUCT_DELETED,
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
  addNewProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
