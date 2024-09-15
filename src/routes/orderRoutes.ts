import { Router } from "express";
import {
  createOrder,
  getInvoice,
  getOrderById,
  getOrderReports,
  getOrders,
  updateOrder,
} from "../controllers/orderController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);
router.get("/report", getOrderReports);
router.route("/").post(createOrder).get(getOrders);
router.route("/:id").patch(updateOrder).get(getOrderById);
router.post("/:id/invoice", getInvoice);

export default router;
