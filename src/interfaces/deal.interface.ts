import { Types } from "mongoose";

export interface IDeal {
  name: string;
  price: number;
  deleted: boolean;
  products: { product: Types.ObjectId; quantity: number }[];
}
