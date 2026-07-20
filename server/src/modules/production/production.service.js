import Production from './production.model.js';

const addNewProduction = async (data) => {
  try {
    return await Production.create(data);
  } catch (error) {
    throw new Error(`Error in addNewProduction: ${error.message}`);
  }
};

const getAllProductions = async () => {
  try {
    return await Production.find()
      .populate('productId', 'name type sku')
      .populate('materialsUsed.productId', 'name type sku');
  } catch (error) {
    throw new Error(`Error in getAllProductions: ${error.message}`);
  }
};

const getProductionById = async (id) => {
  try {
    return await Production.findById(id);
  } catch (error) {
    throw new Error(`Error in getProductionById: ${error.message}`);
  }
};

const makeProductionStart = async (id) => {
  try {
    return await Production.findByIdAndUpdate(
      id,
      { status: 'IN_PROGRESS' },
      { returnDocument: 'after' },
    );
  } catch (error) {
    throw new Error(`Error in makeProductionStart: ${error.message}`);
  }
};

const makeProductionComplete = async (id, data) => {
  try {
    data.status = 'COMPLETED';
    return await Production.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });
  } catch (error) {
    throw new Error(`Error in makeProductionComplete: ${error.message}`);
  }
};

export default {
  addNewProduction,
  getAllProductions,
  getProductionById,
  makeProductionStart,
  makeProductionComplete,
};
