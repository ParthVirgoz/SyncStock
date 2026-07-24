import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    typeId: {
      type: Schema.Types.ObjectId,
      ref: "productType",
      required: true,
    },

    description: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Category = model("category", categorySchema);

export default Category;
