import { Schema, model } from 'mongoose';

const purchaseOrderSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'supplier',
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
        min: 1,
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

  status: {
    type: String,
    enum: ['PENDING', 'RECEIVED'],
    default: 'PENDING',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

purchaseOrderSchema.pre('save', function () {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
});

const PurchaseOrder = model('purchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;
