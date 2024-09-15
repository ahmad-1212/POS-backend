import { model, Schema } from "mongoose";
import { IInventory } from "../interfaces/inventory.interface";
import Ingredient from "./ingredientModel";

const kitchenSchema = new Schema<IInventory>({
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

kitchenSchema.index({ Ingredient: 1 });

kitchenSchema.pre(/^find/, function (next) {
  (this as any).populate("ingredient");
  next();
});

const KitchenInventory = model<IInventory>("KitchenInventory", kitchenSchema);

export default KitchenInventory;
