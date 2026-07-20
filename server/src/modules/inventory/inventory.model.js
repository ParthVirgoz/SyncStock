import { Schema, model } from 'mongoose';

const inventorySchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },

    locationId: {
       type: Schema.Types.ObjectId,
      ref: 'location',
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    reservedQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

const Inventory = model('inventory', inventorySchema);

export default Inventory;
