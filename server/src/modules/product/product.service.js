import Product from "./product.model.js";

const createProduct = async (data) => {
  try {
    return await Product.create(data);
  } catch (error) {
    throw new Error(`Error in createProduct: ${error.message}`);
  }
};

const getAllProducts = async ({ page = 1, limit = 10, type, search } = {}) => {
  try {
    const query = {};

    if (type) query.typeId = type;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name type")
        .populate("typeId", "name type")
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return products;
  } catch (error) {
    throw new Error(`Error in getAllProducts: ${error.message}`);
  }
};

const getProductById = async (id) => {
  try {
    const product = await Product.findById(id).populate(
      "categoryId",
      "name type",
    );
    return product;
  } catch (error) {
    throw new Error(`Error in getProductById: ${error.message}`);
  }
};

const updateProduct = async (id, data) => {
  try {
    const product = await Product.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });
    return product;
  } catch (error) {
    throw new Error(`Error in updateProduct: ${error.message}`);
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await Product.findByIdAndDelete(id);
    return product;
  } catch (error) {
    throw new Error(`Error in deleteProduct: ${error.message}`);
  }
};

export default {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
