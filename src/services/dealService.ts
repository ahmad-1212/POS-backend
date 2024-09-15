import { Types } from "mongoose";
import { DealDto } from "../dtos/deal.dto";
import { IDeal } from "../interfaces/deal.interface";
import Deal from "../models/dealModel";
import createHttpError from "http-errors";

class DealService {
  /**
   * Creates a new deal document in the database.
   *
   * @param {DealDto} dealData - The data for the new deal, including necessary fields.
   * @returns {Promise<IDeal>} - A promise that resolves to the created deal document.
   *
   * @throws {Error} If there is an issue creating the deal, such as a database error.
   */
  public async addDeal(dealData: DealDto): Promise<IDeal> {
    // Create a new deal using the provided data
    const { name } = dealData;
    const isNameExists = await Deal.findOne({ name, deleted: { $ne: true } });
    if (isNameExists)
      throw createHttpError(400, "Name already in use please use another one!");
    const deal = await Deal.create(dealData);
    return deal;
  }

  /**
   * Retrieves all deal documents from the database.
   *
   * @returns {Promise<IDeal[]>} - A promise that resolves to an array of all deal documents.
   *
   * @throws {Error} If there is an issue retrieving the deals, such as a database error.
   */
  public async getAllDeals(): Promise<IDeal[]> {
    // Find and return all deals
    const deals = await Deal.find({ deleted: { $ne: true } });
    return deals;
  }

  /**
   * Updates an existing deal by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the deal to update.
   * @param {DealDto} dealData - The updated data for the deal.
   * @returns {Promise<IDeal>} - A promise that resolves to the updated deal document.
   *
   * @throws {createHttpError} If the deal with the specified ID is not found.
   */
  public async updateDeal(
    id: Types.ObjectId,
    dealData: DealDto
  ): Promise<IDeal> {
    // Update the deal by ID and return the updated document
    const updateDeal = await Deal.findByIdAndUpdate(
      id,
      { ...dealData, deleted: false },
      {
        new: true,
        runValidators: true, // Return the updated document
      }
    );

    // Throw an error if the deal is not found
    if (!updateDeal)
      throw createHttpError(404, `No deal found with the ID: ${id}`);

    return updateDeal;
  }

  /**
   * Deletes a deal document by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the deal to delete.
   * @returns {Promise<void>} - A promise that resolves when the deal is deleted.
   *
   * @throws {Error} If there is an issue deleting the deal, such as a database error.
   */
  public async deleteDeal(id: Types.ObjectId): Promise<void> {
    // Delete the deal by ID

    await Deal.findByIdAndUpdate(id, { deleted: true });
  }

  public async getDealById(id: Types.ObjectId): Promise<IDeal> {
    const deal = await Deal.findById(id);
    if (!deal) throw createHttpError(404, `No deal found with ID: ${id}`);

    return deal;
  }
}

export default new DealService();
