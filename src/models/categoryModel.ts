import { model, Schema } from "mongoose";
import { ICategory } from "../interfaces/category.interface";

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    unique: true,
    required: [true, "Category name is required!"],
  },
  image: {
    type: String,
    required: [true, "Image is required!"],
  },
});

const Category = model<ICategory>("Category", categorySchema);

export default Category;
