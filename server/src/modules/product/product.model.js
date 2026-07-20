import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['FINISHED', 'RAW', 'SEMI'],
      required: true,
    },

    unit: {
      type: String,
      enum: ['kg', 'pcs', 'liters'],
      required: true,
    },

    sku: {
      type: String,
      required: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'category',
    },

    minStockLevel: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  { timestamps: true },
);

const Product = model('product', productSchema);

export default Product;
