import Supplier from './supplier.model.js';

const addSupplier = async (data) => {
  try {
    return await Supplier.create(data);
  } catch (error) {
    throw new Error(`Error in addSupplier: ${error.message}`);
  }
};

const listAllSupplier = async () => {
  try {
    return await Supplier.find();
  } catch (error) {
    throw new Error(`Error in listAllSupplier: ${error.message}`);
  }
};

const updateSupplier = async (id, data) => {
  try {
    return await Supplier.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });
  } catch (error) {
    throw new Error(`Error in updateSupplier: ${error.message}`);
  }
};

const getSupplierById = async (id) => {
  try {
    return await Supplier.findById(id);
  } catch (error) {
    throw new Error(`Error in getSupplierById: ${error.message}`);
  }
};

export default {
  addSupplier,
  listAllSupplier,
  updateSupplier,
  getSupplierById,
};
