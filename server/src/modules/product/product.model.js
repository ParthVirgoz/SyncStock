import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    typeId: {
      type: Schema.Types.ObjectId,
      ref: "productType",
      default: null,
    },

    unit: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: null,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },

    minStockLevel: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  { timestamps: true },
);

const Product = model("product", productSchema);

export default Product;
