import { Schema, model } from 'mongoose';

const supplierSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  contactNumber: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Supplier = model('supplier', supplierSchema);

export default Supplier;
    