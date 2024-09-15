import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import kitchenServices from "../services/kitchenService";

import { InventoryDto } from "../dtos/inventory.dto";

/**
 * Function to get kitchen inventory items
 */
export const getKitchenItems: RequestHandler = catchAsync(
  async (req, res, next) => {
    const items = await kitchenServices.getItems();

    res.status(200).json({
      status: "success",
      length: items.length,
      data: {
        items,
      },
    });
  }
);

/**
 * Function to send items from kitchen inventory to Main inventory
 */
export const sendToMainInventory: RequestHandler<
  {},
  {},
  { items: InventoryDto[] }
> = catchAsync(async (req, res, next) => {
  await kitchenServices.sendToMainInventory(req.body.items);

  res.status(200).json({
    status: "success",
    message: "Items successfully sended to Main Inventory!",
  });
});
