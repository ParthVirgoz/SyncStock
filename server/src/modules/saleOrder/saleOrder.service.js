import SaleOrder from './saleOrder.model.js';

const addNewSalesOrder = async (data) => {
  try {
    return await SaleOrder.create(data);
  } catch (error) {
    throw new Error(`Error in addNewSalesOrder: ${error.message}`);
  }
};

const listSalesOrder = async () => {
  try {
    return await SaleOrder.find().populate('items.productId', 'name type sku');
  } catch (error) {
    throw new Error(`Error in listSaleOrder: ${error.message}`);
  }
};

export default {
  addNewSalesOrder,
  listSalesOrder,
};
