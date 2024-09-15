import { Types } from "mongoose";

export interface IInventory {
  ingredient: Types.ObjectId;
  quantity: number;
}
