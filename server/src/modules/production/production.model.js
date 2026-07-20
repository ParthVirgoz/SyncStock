import { Schema, model } from 'mongoose';

const productionSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },

  quantityToProduce: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING',
  },

  materialsUsed: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  wastage: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  completedAt: {
    type: Date,
    default: null,
  },
});

productionSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'COMPLETED') {
    this.completedAt = new Date();
  }
});

const Production = model('production', productionSchema);

export default Production;
