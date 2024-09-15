import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/productController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);
router.route("/").get(getAllProducts).post(addProduct);
router.route("/:id").get(getProduct).patch(updateProduct).delete(deleteProduct);

export default router;
