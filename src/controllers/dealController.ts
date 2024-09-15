import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import { DealDto, UpdateDealDto } from "../dtos/deal.dto";
import dealService from "../services/dealService";
import { Types } from "mongoose";

/**
 * Function to add or create a deal
 */
export const addDeal: RequestHandler<{}, {}, DealDto> = catchAsync(
  async (req, res) => {
    const deal = await dealService.addDeal(req.body);

    res.status(201).json({
      status: "success",
      message: "Deal successfully created!",
      data: {
        deal,
      },
    });
  }
);

/**
 * Function to retrieve all deals
 */
export const getAllDeals: RequestHandler = catchAsync(async (req, res) => {
  const deals = await dealService.getAllDeals();

  res.status(200).json({
    status: "success",
    length: deals.length,
    data: {
      deals,
    },
  });
});

/**
 * Function to get deal by ID
 */
export const getDealById: RequestHandler<{ id: string }> = catchAsync(
  async (req, res) => {
    const id = new Types.ObjectId(req.params.id);
    const deal = await dealService.getDealById(id);

    res.status(200).json({
      status: "success",

      data: {
        deal,
      },
    });
  }
);

/**
 * Function to update a deal
 */
export const updateDeal: RequestHandler<{ id: string }, {}, UpdateDealDto> =
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const newObjId = new Types.ObjectId(id);
    const deal = await dealService.updateDeal(newObjId, req.body);

    res.status(200).json({
      status: "success",
      message: "Deal successfully updated!",
      data: {
        deal,
      },
    });
  });

/**
 * Function to delete a deal
 */
export const deleteDeal: RequestHandler<{ id: string }> = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const newObjId = new Types.ObjectId(id);
    await dealService.deleteDeal(newObjId);

    res.status(200).json({
      status: "success",
      message: "Deal successfully deleted!",
    });
  }
);
