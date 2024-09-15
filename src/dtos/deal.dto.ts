import { Types } from "mongoose";

export interface DealDto {
  name: string;
  price: number;
  products: Types.ObjectId[];
}

export interface UpdateDealDto {
  name?: string;
  price?: number;
  products?: Types.ObjectId[];
}
