import tableService from "../services/tableService";
import catchAsync from "../util/catchAsync";

/**
 * Function to get tables
 */
export const getTables = catchAsync(async (req, res, next) => {
  const tables = await tableService.getAllTables();

  res.status(200).json({
    status: "success",
    data: {
      tables,
    },
  });
});

/**
 * Function to create a table
 */
export const createTable = catchAsync(async (req, res, next) => {});

/**
 * Function to update a table
 */
export const updateTable = catchAsync(async (req, res, next) => {});
