import { Types } from "mongoose";

export interface OrderDto {
  orderId: string;
  type: "dine_in" | "delivery" | "take_away";
  table?: number;
  total?: number;
  customerName?: string;
  phoneNumber?: string;
  address?: string;
  products: { quantity: number; product: Types.ObjectId }[];
  deals: { quantity: number; deal: Types.ObjectId }[];
}

export interface UpdateOrderDto {
  total: number;
  type: "dine_in" | "delivery" | "take_away";
  customerName?: string;
  phoneNumber?: string;
  address?: string;
}
