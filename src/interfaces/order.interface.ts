import { Types } from "mongoose";

export interface IOrder {
  orderId: string;
  type: "dine_in" | "delivery" | "take_away";
  table?: number;
  customerName?: string;
  phoneNumber?: string;
  address?: string;
  total: number;
  status: "processing" | "completed" | "cancelled";
  products: { quantity: number; product: Types.ObjectId }[];
  deals: { quantity: number; deal: Types.ObjectId }[];
  createdAt?: Date;
  updatedAt?: Date;
}
