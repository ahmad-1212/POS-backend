import { model, Schema } from "mongoose";
import { IInventory } from "../interfaces/inventory.interface";

const mainInventorySchema = new Schema<IInventory>({
  ingredient: {
    type: Schema.Types.ObjectId,
    ref: "Ingredient",
    required: [true, "Ingredient ID is required!"],
    _id: false,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity of ingredient is required!"],
  },
});

mainInventorySchema.pre(/^find/, function (next) {
  (this as any).populate("ingredient");
  next();
});

const MainInventory = model<IInventory>("MainInventory", mainInventorySchema);

export default MainInventory;
