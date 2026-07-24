import { Schema, model } from 'mongoose';

const productTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

  },
  { timestamps: true },
);

const ProductType = model('productType', productTypeSchema);

export default ProductType;