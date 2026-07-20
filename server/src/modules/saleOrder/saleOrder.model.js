import { Schema, model } from 'mongoose';

const saleOrderSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },

  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],

  totalAmount: {
    type: Number,
    min: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


saleOrderSchema.pre('save', function () {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
});

const SaleOrder = model('saleOrder', saleOrderSchema);

export default SaleOrder;
