import ProductType from "./productType.model.js";

const createProductType = async (data) => {
  try {
    return await ProductType.create(data);
  } catch (error) {
    throw new Error(`Error in createProductType: ${error.message}`);
  }
};

const getProductTypes = async (filter = {}) => {
  try {
    return await ProductType.find(filter).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error in getProductTypes: ${error.message}`);
  }
};

const getProductTypeById = async (id) => {
  try {
    return await ProductType.findById(id);
  } catch (error) {
    throw new Error(`Error in getProductTypeById: ${error.message}`);
  }
};

const updateProductType = async (id, data) => {
  try {
    return await ProductType.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });
  } catch (error) {
    throw new Error(`Error in updateProductType: ${error.message}`);
  }
};

const deleteProductType = async (id) => {
  try {
    return await ProductType.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error in deleteProductType: ${error.message}`);
  }
};

export default {
  createProductType,
  getProductTypes,
  getProductTypeById,
  updateProductType,
  deleteProductType,
};
