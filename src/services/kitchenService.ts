import createHttpError from "http-errors";

import KitchenInventory from "../models/kitchenModel";
import mainInventoryService from "./mainInventoryService";
import { InventoryDto } from "../dtos/inventory.dto";
import { IInventory } from "../interfaces/inventory.interface";

class KitchenInventoryService {
  public async getItems(): Promise<IInventory[]> {
    const items = await KitchenInventory.find();
    return items;
  }

  public async addItems(data: InventoryDto | InventoryDto[]): Promise<void> {
    if (!Array.isArray(data)) {
      const { quantity, ingredient } = data;
      const isItemExistsInKitchen = await KitchenInventory.findOne({
        ingredient,
      });

      if (isItemExistsInKitchen) {
        isItemExistsInKitchen.quantity += quantity;
        await isItemExistsInKitchen.save();
      } else {
        await KitchenInventory.create(data);
      }
    } else {
      for (const item of data) {
        const { quantity, ingredient } = item;
        const isItemExistsInKitchen = await KitchenInventory.findOne({
          ingredient,
        });

        if (isItemExistsInKitchen) {
          isItemExistsInKitchen.quantity += quantity;
          await isItemExistsInKitchen.save();
        } else {
          await KitchenInventory.create(data);
        }
      }
    }
  }

  // Helper function to check and update a single inventory item
  private async checkAndDeductInventoryItem(
    ingredient: string,
    quantity: number
  ): Promise<void> {
    const inventoryItem = await KitchenInventory.findOne({ ingredient });
    if (!inventoryItem) {
      throw createHttpError(404, `No ingredient found with ID: ${ingredient}`);
    }

    if (inventoryItem.quantity < quantity) {
      throw createHttpError(
        400,
        `Only ${inventoryItem.quantity} is available for ${
          (inventoryItem.ingredient as any).name
        }, but you requested to transfer ${quantity}`
      );
    }

    // Deduct the requested quantity from the Main Inventory
    inventoryItem.quantity -= quantity;
    await inventoryItem.save();
  }

  // Main function to process the list of items
  public async sendToMainInventory(data: InventoryDto[]): Promise<void> {
    for (const item of data) {
      const { ingredient, quantity } = item;
      // Call the helper function to check and update each item
      await this.checkAndDeductInventoryItem(ingredient, quantity);
    }

    // After checking and updating all items, send the data to the kitchen service
    await mainInventoryService.addItems(data);
  }
}

export default new KitchenInventoryService();
