import PurchaseOrder from './purchaseOrder.model.js';

const createPurchase = async (data) => {
  try {
    return await PurchaseOrder.create(data);
  } catch (error) {
    throw new Error(`Error in createPurchase: ${error.message}`);
  }
};

const listPurchases = async () => {
  try {
    return await PurchaseOrder.find()
      .populate('supplierId', 'name contactNumber')
      .populate('items.productId', 'name type sku');
  } catch (error) {
    throw new Error(`Error in listPurchases: ${error.message}`);
  }
};

const makePurchaseReceive = async (id) => {
  try {
    return await PurchaseOrder.findByIdAndUpdate(
      id,
      { status: 'RECEIVED' },
      { returnDocument: 'after' },
    );
  } catch (error) {
    throw new Error(`Error in makePurchaseReceive: ${error.message}`);
  }
};

const getPurchaseById = async (id) => {
  try {
    return await PurchaseOrder.findById(id);
  } catch (error) {
    throw new Error(`Error in getPurchaseById: ${error.message}`);
  }
};

export default {
  createPurchase,
  listPurchases,
  makePurchaseReceive,
  getPurchaseById,
};
