import createHttpError from "http-errors";
import MainInventory from "../models/mainInventoryModel";
import kitchenServices from "./kitchenService";
import { InventoryDto } from "../dtos/inventory.dto";
import { IInventory } from "../interfaces/inventory.interface";

class MainInventoryService {
  private async saveToDB(ingredient: string, quantity: number): Promise<void> {
    const isIngredientExists = await MainInventory.findOne({ ingredient });

    if (isIngredientExists) {
      isIngredientExists.quantity += quantity;
      await isIngredientExists.save();
    } else {
      await MainInventory.create({ ingredient, quantity });
    }
  }

  public async addItems(data: InventoryDto | InventoryDto[]): Promise<void> {
    if (!Array.isArray(data)) {
      const { ingredient, quantity } = data;
      await this.saveToDB(ingredient, +quantity);
    } else {
      for (const itm of data) {
        const { ingredient, quantity } = itm;
        await this.saveToDB(ingredient, +quantity);
      }
    }
  }

  public async updateItem(data: InventoryDto): Promise<void> {
    const item = await MainInventory.findOne({ ingredient: data.ingredient });
    if (!item)
      throw createHttpError(404, `No item were found with ID to update!`);
    item.quantity = data.quantity;
    await item.save();
  }

  public async getItems(): Promise<IInventory[]> {
    const items = await MainInventory.find();
    return items;
  }

  // Helper function to check and update a single inventory item
  private async checkAndDeductInventoryItem(
    ingredient: string,
    quantity: number
  ): Promise<void> {
    const inventoryItem = await MainInventory.findOne({ ingredient });
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
    await kitchenServices.addItems({ ingredient, quantity });
    await inventoryItem.save();
  }

  // Main function to process the list of items
  public async sendToKitchen(data: InventoryDto[]): Promise<void> {
    for (const item of data) {
      const { ingredient, quantity } = item;
      // Call the helper function to check and update each item
      await this.checkAndDeductInventoryItem(ingredient, quantity);
    }
  }
}

export default new MainInventoryService();
