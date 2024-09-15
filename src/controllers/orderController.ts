import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import orderService from "../services/orderService";
import { OrderDto, UpdateOrderDto } from "../dtos/order.dto";

/**
 * Function to create order
 */
export const createOrder: RequestHandler<{}, {}, OrderDto> = catchAsync(
  async (req, res, next) => {
    const order = await orderService.createOrder(req.body);

    res.status(200).json({
      status: "success",
      message: "Order successfully created!",
      data: {
        order,
      },
    });
  }
);

/**
 * Function to update order
 */
export const updateOrder: RequestHandler<{ id: string }, {}, UpdateOrderDto> =
  catchAsync(async (req, res, next) => {
    const order = await orderService.updateOrder(req.params.id, req.body);

    res.status(200).json({
      status: "success",
      message: "Order successfully updated!",
      data: {
        order,
      },
    });
  });

/**
 * Function to get orders
 */

export const getOrders: RequestHandler<
  {},
  {},
  {},
  { days_range: string; active_only: string }
> = catchAsync(async (req, res, next) => {
  const { days_range, active_only } = req.query;
  const lastDays = Number(days_range || 7);
  const orders = await orderService.getOrders(
    lastDays,
    active_only === "true" ? true : false
  );

  res.status(200).json({
    status: "success",
    length: orders.length,
    data: {
      orders,
    },
  });
});

/**
 * Function to get order by id
 */

export const getOrderById: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    const order = await orderService.getOrderById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  }
);

/**
 * Function to update order status and return order invoice
 *
 */
export const getInvoice: RequestHandler<
  { id: string },
  {},
  {},
  { days_range: string }
> = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderService.getInvoice(id);

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * Function to get order reports
 */
export const getOrderReports: RequestHandler<
  {},
  {},
  {},
  { days_range: string }
> = catchAsync(async (req, res, next) => {
  const { days_range } = req.query;
  console.log(days_range);
  const result = await orderService.getOrdersReport(Number(days_range));
  res.status(200).json({
    status: "success",
    data: {
      report: result,
    },
  });
});
