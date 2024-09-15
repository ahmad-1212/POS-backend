import mongoose from "mongoose"; // Import mongoose for transactions
import { OrderDto } from "../dtos/order.dto";
import { IOrder } from "../interfaces/order.interface";
import Order from "../models/orderModel";
import createHttpError from "http-errors";
import Product from "../models/productModel";
import KitchenInventory from "../models/kitchenModel";
import Deal from "../models/dealModel";
import { IProduct } from "../interfaces/product.interface";
import Table from "../models/tableModel";

class OrderService {
  private async restoreInventory(
    order: IOrder,
    session: mongoose.ClientSession
  ): Promise<void> {
    const { products, deals } = order;

    const combinedProducts = await this.combineProductsAndDeals(
      products,
      deals
    );

    // Restore inventory quantities
    for (const prod of combinedProducts) {
      const isProd = await Product.findById(prod.product).session(session);

      if (isProd) {
        const { ingredients } = isProd;
        for (const ing of ingredients) {
          const isIng = await KitchenInventory.findOne({
            ingredient: ing.ingredient,
          }).session(session);

          if (isIng) {
            isIng.quantity += ing.quantity * prod.quantity;
            await isIng.save({ session });
          }
        }
      }
    }
  }

  private async combineProductsAndDeals(
    products: any[],
    deals?: any[]
  ): Promise<{ product: any; quantity: number }[]> {
    const combinedProducts = [...products];

    if (deals && deals.length > 0) {
      for (const deal of deals) {
        const foundDeal = await Deal.findById(deal.deal);
        if (!foundDeal)
          throw createHttpError(404, "One of the deals was not found!");

        for (const dealProduct of foundDeal.products) {
          const existingProductIndex = combinedProducts.findIndex(
            (p) => p.product.toString() === dealProduct.product._id.toString()
          );

          if (existingProductIndex > -1) {
            combinedProducts[existingProductIndex].quantity +=
              dealProduct.quantity * deal.quantity;
          } else {
            combinedProducts.push({
              product: dealProduct.product._id,
              quantity: dealProduct.quantity * deal.quantity,
            });
          }
        }
      }
    }

    return combinedProducts;
  }

  private async validateStock(
    combinedProducts: { product: any; quantity: number }[],
    session: mongoose.ClientSession
  ): Promise<void> {
    let total = 0;
    for (const prod of combinedProducts) {
      const isProd = await Product.findById(prod.product).session(session);
      if (!isProd)
        throw createHttpError(404, "One of the products was not found!");

      total += isProd.price * prod.quantity;
      const { ingredients } = isProd;
      for (const ing of ingredients) {
        const isIng = await KitchenInventory.findOne({
          ingredient: ing.ingredient,
        }).session(session);

        if (!isIng)
          throw createHttpError(
            404,
            `No stocks of ${
              (ing.ingredient as any).name
            } were found in Kitchen!`
          );

        if (ing.quantity * prod.quantity > isIng.quantity)
          throw createHttpError(
            400,
            `Not enough stock for ${(ing.ingredient as any).name}`
          );
      }
    }
  }

  private async deductStock(
    combinedProducts: { product: any; quantity: number }[],
    session: mongoose.ClientSession
  ): Promise<void> {
    for (const prod of combinedProducts) {
      const isProd = await Product.findById(prod.product).session(session);
      const { ingredients } = isProd as IProduct;

      for (const ing of ingredients) {
        const isIng = await KitchenInventory.findOne({
          ingredient: ing.ingredient,
        }).session(session);

        if (isIng) {
          if (ing.quantity * prod.quantity > isIng.quantity)
            throw createHttpError(
              400,
              `Not enough stock for ${(ing.ingredient as any).name}`
            );

          isIng.quantity -= ing.quantity * prod.quantity;
          await isIng.save({ session });
        }
      }
    }
  }

  private async checkTableInfo(
    tableNum: number,
    type: string,
    session: mongoose.ClientSession
  ) {
    if (!tableNum)
      throw createHttpError(400, "Table number is required in dine_in orders!");

    const isTable = await Table.findOne({ number: tableNum }).session(session);
    if (!isTable)
      throw createHttpError(
        404,
        "No table were found with table number: " + tableNum
      );

    if (isTable.isReserved)
      throw createHttpError(400, `Table ${tableNum} is already reserved!`);

    isTable.isReserved = true;
    await isTable.save({ session });
  }

  public async createOrder(ordData: OrderDto): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { products, deals, type, table } = ordData;
      if (type === "dine_in") {
        await this.checkTableInfo(Number(table), type, session);
      }

      // Step 1: Create the order
      const newOrder = await Order.create([ordData], { session });

      const combinedProducts = await this.combineProductsAndDeals(
        products,
        deals
      );

      // Step 2: Validate stock for all products
      await this.validateStock(combinedProducts, session);

      // Step 3: Deduct stock after validation
      await this.deductStock(combinedProducts, session);

      await session.commitTransaction();
      session.endSession();

      return newOrder[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  public async updateOrder(
    orderId: string,
    updateData: OrderDto
  ): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingOrder = await Order.findOne({ orderId }).session(session);
      if (!existingOrder) throw createHttpError(404, "Order not found!");

      // Step 4: Update the order
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId },
        updateData,
        {
          new: true, // Return the updated document
          session, // Pass the session to ensure transaction
        }
      );

      // Step 1: Restore inventory for the existing order
      await this.restoreInventory(existingOrder, session);

      const combinedProducts = await this.combineProductsAndDeals(
        updateData.products,
        updateData.deals
      );

      // Step 2: Validate stock for the new products
      await this.validateStock(combinedProducts, session);

      // Step 3: Deduct stock for the new products
      await this.deductStock(combinedProducts, session);

      await session.commitTransaction();
      session.endSession();

      if (!updatedOrder) throw createHttpError("No order found!");
      return updatedOrder;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  public async deleteOrder(orderId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingOrder = await Order.findOne({ orderId }).session(session);
      if (!existingOrder) throw createHttpError(404, "Order not found!");

      // Step 1: Restore inventory for the existing order
      await this.restoreInventory(existingOrder, session);

      // Step 2: Delete the order
      await Order.deleteOne({ orderId }).session(session);

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  public async getInvoice(id: string): Promise<IOrder> {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: id },
      {
        status: "completed",
      },
      { new: true }
    );

    if (!updatedOrder)
      throw createHttpError(404, `Order not found with ID: ${id}`);
    if (updatedOrder.type === "dine_in") {
      await Table.findOneAndUpdate(
        { number: updatedOrder.table },
        { isReserved: false }
      );
    }

    return updatedOrder;
  }

  public async getOrders(
    lastDays: number = 7,
    active_only: boolean = false
  ): Promise<IOrder[]> {
    const endDate = new Date(); // Current date and time
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - lastDays); // Calculate the start date

    // Query to find all orders within the last 'lastDays' days
    let orders;
    if (active_only) {
      orders = await Order.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: "processing",
      }).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ createdAt: -1 });
    }
    return orders;
  }

  public async getOrderById(id: string): Promise<IOrder> {
    const order = await Order.findOne({ orderId: id });
    if (!order) throw createHttpError(404, `No order found with ID: ${id}`);
    return order;
  }

  public async getOrdersReport(days: number = 7): Promise<any> {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - days);

    interface CombineResult {
      _id: Date;
      totalDailyPrice: number;
      totalDailyProfit: number;
    }

    const productResult = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gt: pastDate,
            $lte: now,
          },
        },
      },
      {
        $unwind: {
          path: "$products",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $unwind: {
          path: "$productDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          productProfit: {
            $cond: {
              if: { $gt: ["$products", null] },
              then: {
                $multiply: [
                  {
                    $subtract: ["$productDetail.price", "$productDetail.cost"],
                  },
                  "$products.quantity",
                ],
              },
              else: 0,
            },
          },
          productPrice: {
            $cond: {
              if: { $gt: ["$products", null] },
              then: {
                $multiply: ["$productDetail.price", "$products.quantity"],
              },
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: {
            orderId: "$_id",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalPrice: { $sum: "$productPrice" },
          totalProfit: { $sum: "$productProfit" },
        },
      },
      {
        $match: {
          totalPrice: { $gt: 0 },
          totalProfit: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalDailyPrice: { $sum: "$totalPrice" },
          totalDailyProfit: { $sum: "$totalProfit" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending (use -1 for descending)
      },
    ]);

    const dealsResult = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gt: pastDate,
            $lte: now,
          },
        },
      },
      // Extract the date part from createdAt
      {
        $addFields: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      // Step 1: Unwind the deals array
      { $unwind: "$deals" },

      // Step 2: Lookup deal details (including products and price)
      {
        $lookup: {
          from: "deals",
          localField: "deals.deal",
          foreignField: "_id",
          as: "dealDetails",
        },
      },
      { $unwind: "$dealDetails" }, // Unwind the deal details

      // Step 3: Unwind products array inside the deal
      { $unwind: "$dealDetails.products" },

      // Step 4: Lookup product details (including cost)
      {
        $lookup: {
          from: "products",
          localField: "dealDetails.products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Unwind the product details

      // Step 5: Calculate the profit for each product
      {
        $addFields: {
          productProfit: {
            $multiply: [
              "$dealDetails.products.quantity",
              "$productDetails.cost",
            ],
          },
        },
      },

      // Step 6: Calculate total cost and profit for the deal
      {
        $group: {
          _id: {
            orderId: "$_id",
            dealId: "$deals.deal",
            date: "$date",
          },
          totalProductCost: { $sum: "$productProfit" },
          dealPrice: { $first: "$dealDetails.price" },
          dealQuantity: { $first: "$deals.quantity" },
        },
      },

      // Step 7: Calculate final profit for each deal
      {
        $addFields: {
          totalDealPrice: {
            $multiply: ["$dealPrice", "$dealQuantity"],
          },
          totalDealProfit: {
            $subtract: [
              { $multiply: ["$dealPrice", "$dealQuantity"] },
              { $multiply: ["$totalProductCost", "$dealQuantity"] },
            ],
          },
        },
      },

      // Step 8: Group by date to sum up the total price and profit
      {
        $group: {
          _id: "$_id.date",
          totalDailyPrice: { $sum: "$totalDealPrice" },
          totalDailyProfit: { $sum: "$totalDealProfit" },
        },
      },

      // Step 9: Sort by date
      {
        $sort: { _id: 1 }, // Sort by date ascending (use -1 for descending)
      },
    ]);

    const totalOrders = await Order.countDocuments({
      createdAt: {
        $gt: pastDate,
        $lte: now,
      },
    });

    interface DailyResult {
      _id: string; // Date in YYYY-MM-DD format
      totalProductPrice?: number;
      totalProductProfit?: number;
      totalDailyPrice?: number;
      totalDailyProfit?: number;
    }

    interface CombinedResult {
      _id: string;
      totalDailyPrice: number;
      totalDailyProfit: number;
    }

    // Function to combine results
    function combineResults(
      productResults: DailyResult[],
      dealsResults: DailyResult[]
    ): CombinedResult[] {
      // Combine both results into a single object
      const combined: { [key: string]: CombinedResult } = {};

      // Helper function to add results to combined object
      function addResults(results: DailyResult[]) {
        results.forEach((item) => {
          const date = item._id;
          if (!combined[date]) {
            combined[date] = {
              _id: date,
              totalDailyPrice: 0,
              totalDailyProfit: 0,
            };
          }
          if (item.totalProductPrice !== undefined) {
            combined[date].totalDailyPrice += item.totalProductPrice;
          }
          if (item.totalProductProfit !== undefined) {
            combined[date].totalDailyProfit += item.totalProductProfit;
          }
          if (item.totalDailyPrice !== undefined) {
            combined[date].totalDailyPrice += item.totalDailyPrice;
          }
          if (item.totalDailyProfit !== undefined) {
            combined[date].totalDailyProfit += item.totalDailyProfit;
          }
        });
      }

      // Process both product and deals results
      addResults(productResults);
      addResults(dealsResults);

      // Convert combined object to array
      const finalResult: CombinedResult[] = Object.values(combined);

      // Sort by date
      finalResult.sort(
        (a, b) => new Date(a._id).getTime() - new Date(b._id).getTime()
      );

      return finalResult;
    }

    // Example usage
    const finalResult = combineResults(productResult, dealsResult);
    const total = finalResult.reduce(
      (acc, itm) => {
        acc.totalDailySale += itm.totalDailyPrice;
        acc.totalDailyProfit += itm.totalDailyProfit;
        return acc;
      },
      { totalDailySale: 0, totalDailyProfit: 0 }
    );

    return {
      totalSale: total.totalDailySale,
      totalProfit: total.totalDailyProfit,
      totalOrders,
      dailyReport: finalResult,
    };
  }
}

export default new OrderService();
