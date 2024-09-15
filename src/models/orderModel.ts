import { model, Schema, Types } from "mongoose";
import { IOrder } from "../interfaces/order.interface";

function requiredWhenDineIn(this: IOrder): boolean {
  if (this.type === "dine_in") return true;
  else return false;
}

function requiredWhenNotDineIn(this: IOrder): boolean {
  if (this.type !== "dine_in") return true;
  else return false;
}

function requiredWhenDelivery(this: IOrder): boolean {
  if (this.type === "delivery") return true;
  else return false;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: {
        values: ["dine_in", "delivery", "take_away"],
        message:
          "Invalid value, Please choose between dine_in, delivery, or take_away",
      },
      required: [true, "Type of the order is required!"],
    },
    table: {
      type: String,
      required: [requiredWhenDineIn, "Table is required!"],
    },
    status: {
      type: String,
      enum: ["processing", "completed", "cancelled"],
      default: "processing",
    },
    customerName: {
      type: String,
      required: [
        requiredWhenNotDineIn,
        "Customer name is required for non-dine_in orders!",
      ],
    },
    phoneNumber: {
      type: String,
      required: [
        requiredWhenNotDineIn,
        "Phone number is required for non-dine_in orders!",
      ],
    },
    address: {
      type: String,
      required: [
        requiredWhenDelivery,
        "Address is required for non-dine_in orders!",
      ],
    },
    products: {
      type: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            default: 1,
          },
          _id: false,
        },
      ],
      validate: {
        validator: function (this: IOrder) {
          return this.products.length > 0 || this.deals.length > 0;
        },
        message: "Please add at least one product or deal to the order!",
      },
    },
    deals: {
      type: [
        {
          deal: {
            type: Schema.Types.ObjectId,
            ref: "Deal",
          },
          quantity: {
            type: Number,
            default: 1,
          },
          _id: false,
        },
      ],
    },
    total: Number,
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  // Create custom orderId before saving the order to db
  if (!this.isNew) return next();
  const orders = await Order.countDocuments();
  const newId = `ord-${orders + 1}`;
  this.orderId = newId;
  next();
});

orderSchema.pre(/^find/, async function (next) {
  (this as any)
    .populate({
      path: "products.product",
      select: "+name +price ",
    })
    .populate({
      path: "deals.deal",
      select: "+name +price",
    });
  next();
});

const Order = model<IOrder>("Order", orderSchema);

export default Order;
