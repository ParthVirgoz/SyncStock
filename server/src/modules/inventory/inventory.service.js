import Inventory from './inventory.model.js';

const addInventory = async (data) => {
  try {
    return await Inventory.create(data);
  } catch (error) {
    throw new Error(`Error in addInventory: ${error.message}`);
  }
};

const listInventory = async () => {
  try {
    return await Inventory.find()
      .populate('productId', 'name type sku minStockLevel')
      .populate('locationId', 'name type address ');
  } catch (error) {
    throw new Error(`Error in listInventory: ${error.message}`);
  }
};

const getExistingInventory = async (productId, locationId) => {
  try {
    return await Inventory.findOne({ productId, locationId });
  } catch (error) {
    throw new Error(`Error in getExistingInventory: ${error.message}`);
  }
};

const updateQuantity = async (productId, locationId, quantity) => {
  try {    
    return await Inventory.findOneAndUpdate(
      { productId, locationId },
      { $inc: { quantity } },
      { returnDocument: 'after' },
    );
  } catch (error) {
    throw new Error(`Error in updateQuantity: ${error.message}`);
  }
};

export default {
  addInventory,
  listInventory,
  getExistingInventory,
  updateQuantity,
};
