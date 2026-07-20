import BOM from './bom.model.js';

const addBOM = async (data) => {
  try {
    return await BOM.create(data);
  } catch (error) {
    throw new Error(`Error in addBOM: ${error.message}`);
  }
};

const getBOMById = async (id) => {
  try {
    return await BOM.findById(id);
  } catch (error) {
    throw new Error(`Error in getBOMById: ${error.message}`);
  }
};

const getBOMByProduct = async (productId) => {
  try {
    return await BOM.find({ productId })
      .populate('productId', 'name type sku')
      .populate('materials.productId', 'name type sku');
  } catch (error) {
    throw new Error(`Error in addBOM: ${error.message}`);
  }
};

const updateBOM = async (id, data) => {
  try {
    return await BOM.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  } catch (error) {
    throw new Error(`Error in updateBOM: ${error.message}`);
  }
};

export default {
  addBOM,
  getBOMById,
  getBOMByProduct,
  updateBOM,
};
