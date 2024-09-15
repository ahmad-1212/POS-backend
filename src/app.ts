import express, { Response, Request, NextFunction } from "express";
import morgan from "morgan";
import createError from "http-errors";
import cors from "cors";
import env from "./config/env";
import path from "path";
import userRoutes from "./routes/userRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import ingredientRoutes from "./routes/ingredientRoutes";
import productRoutes from "./routes/productRoutes";
import dealRoutes from "./routes/dealRoutes";
import orderRoutes from "./routes/orderRoutes";
import mainInventoryRoutes from "./routes/mainInventoryRoutes";
import kitchenInventoryRoutes from "./routes/kitchenInventoryRoutes";
import tableRoutes from "./routes/tableRoutes";
import GlobalErrorHandler from "./controllers/errorController";

// Initialize app
const app = express();

/**
 * Middlewares
 */

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/public", express.static(path.join(__dirname, "../public")));

// Cors
app.use(cors());

if (env.isDevelopment) {
  app.use(morgan("dev"));
}

/**
 * Routes
 */
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/ingredients", ingredientRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/deals", dealRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/inventories/main", mainInventoryRoutes);
app.use("/api/v1/inventories/kitchen", kitchenInventoryRoutes);
app.use("/api/v1/tables", tableRoutes);

/**
 * Error handling
 */
app.all("*", (req, _, next) => {
  next(
    createError(
      404,
      `The route "${req.originalUrl} were not found on this server!"`
    )
  );
});

app.use(GlobalErrorHandler);

export default app;
