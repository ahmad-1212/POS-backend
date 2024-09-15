import { model, Schema } from "mongoose";
import { IProduct } from "../interfaces/product.interface";
import Deal from "./dealModel";

const productSchema = new Schema<IProduct>({
  name: {
    type: String,

    required: [true, "Product name is required!"],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required!"],
  },
  cost: {
    type: Number,
    required: [true, "Cost is required!"],
  },
  price: {
    type: Number,
    required: [true, "Price is required!"],
  },
  ingredients: {
    type: [
      {
        ingredient: {
          type: Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        _id: false,
      },
    ],
    validate: {
      validator: function (arr: any[]) {
        return arr.length > 0;
      },
      message: "Please add at least one ingredient!",
    },
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

productSchema.pre(/^find/, function (next) {
  const query = this as any;

  query
    .populate({
      path: "category",
    })
    .populate("ingredients.ingredient");
  next();
});

const Product = model<IProduct>("Product", productSchema);

export default Product;
