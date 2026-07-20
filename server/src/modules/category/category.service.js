import Category from './category.model.js';

const addCategory = async (data) => {
  try {
    return await Category.create(data);
  } catch (error) {
    throw new Error(`Error in addCategory: ${error.message}`);
  }
};

const listCategory = async (isActive) => {
  try {
    let filter = {};

    if (isActive === 'true') {
      filter.isActive = true;
    }

    return await Category.find(filter).lean();
  } catch (error) {
    throw new Error(`Error in listCategory: ${error.message}`);
  }
};

const updateCategory = async (id, data) => {
  try {
    return await Category.findByIdAndUpdate(id, data, { returnDocument: true });
  } catch (error) {
    throw new Error(`Error in updateCategory: ${error.message}`);
  }
};

const getCategoryById = async (id) => {
  try {
    return await Category.findById(id);
  } catch (error) {
    throw new Error(`Error in getCategoryById: ${error.message}`);
  }
};

export default {
  addCategory,
  listCategory,
  updateCategory,
  getCategoryById,
};
