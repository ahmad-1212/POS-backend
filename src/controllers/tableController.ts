import { RequestHandler } from 'express';
import tableService from '../services/tableService';
import catchAsync from '../util/catchAsync';
import { Types } from 'mongoose';

/**
 * Function to get tables
 */
export const getTables = catchAsync(async (req, res, next) => {
  const tables = await tableService.getAllTables();

  res.status(200).json({
    status: 'success',
    data: {
      tables,
    },
  });
});

/**
 * Function to create a table
 */
export const createTable = catchAsync(async (req, res, next) => {
  const newTable = await tableService.createTable();

  res.status(201).json({
    status: 'success',
    data: {
      newTable,
    },
  });
});

/**
 * Function to create a table
 */
export const deleteTable: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    await tableService.deleteTable(new Types.ObjectId(req.params.id));

    res.status(200).json({
      status: 'success',
      message: 'Table successfully deleted!',
    });
  }
);
