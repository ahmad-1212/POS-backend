import { model, Schema } from "mongoose";
import { IDeal } from "../interfaces/deal.interface";

const dealSchema = new Schema<IDeal>(
  {
    name: {
      type: String,
      required: [true, "Deal name is required!"],
    },
    price: {
      type: Number,
      required: [true, "Price is required!"],
    },
    products: {
      type: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
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
        message: "Please add at least one product!",
      },
    },
    deleted: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

dealSchema.pre(/^find/, function (this: any, next) {
  this.populate({
    path: "products.product",
    select: "-ingredients",
  });

  next();
});

const Deal = model<IDeal>("Deal", dealSchema);

export default Deal;
