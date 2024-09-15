import { model, Schema } from "mongoose";
import { IIngredient } from "../interfaces/ingredient.interface";

const ingredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    unique: true,
    required: [true, "Ingredient name is required!"],
  },
  unit: {
    type: String,
    required: [true, "Unit is required!"],
    enum: {
      values: ["g", "ltr", "pcs"],
      message: "Not a valid unit, please choose a valid unit!",
    },
  },
});

const Ingredient = model<IIngredient>("Ingredient", ingredientSchema);

export default Ingredient;
