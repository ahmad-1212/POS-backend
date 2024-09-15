import { Types } from "mongoose";

export interface IProduct {
  name: string;
  category: Types.ObjectId;
  cost: number;
  price: number;
  deleted: boolean;
  ingredients: { ingredient: Types.ObjectId; quantity: number }[];
}
