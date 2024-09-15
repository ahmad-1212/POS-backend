import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import mainInventoryService from "../services/mainInventoryService";

import { InventoryDto } from "../dtos/inventory.dto";

/**
 * Function to add item to main inventory
 */
export const addItemToMain: RequestHandler<{}, {}, InventoryDto> = catchAsync(
  async (req, res, next) => {
    await mainInventoryService.addItems(req.body);

    res.status(200).json({
      status: "success",
      message: "Item successfully added to Main Inventory!",
    });
  }
);

/**
 * Function to retreive main inventory
 */
export const getMainInventory: RequestHandler = catchAsync(
  async (req, res, next) => {
    const items = await mainInventoryService.getItems();

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
 * Function to send items to kitchen
 */
export const sendToKitchen: RequestHandler<{}, {}, { items: InventoryDto[] }> =
  catchAsync(async (req, res, next) => {
    const { items: ingredientsArr } = req.body;
    await mainInventoryService.sendToKitchen(ingredientsArr);

    res.status(200).json({
      status: "success",
      message: "Items successfully added to kitchen inventory!",
    });
  });

/**
 * Function to update items in Main inventory
 */
export const updateItem: RequestHandler<{}, {}, InventoryDto> = catchAsync(
  async (req, res, next) => {
    await mainInventoryService.updateItem(req.body);

    res.status(200).json({
      status: "success",
      message: "Items successfully updated!",
    });
  }
);
