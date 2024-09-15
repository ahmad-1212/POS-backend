import { Router } from "express";
import {
  addDeal,
  deleteDeal,
  getAllDeals,
  getDealById,
  updateDeal,
} from "../controllers/dealController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);
router.route("/").get(getAllDeals).post(addDeal);
router.route("/:id").get(getDealById).patch(updateDeal).delete(deleteDeal);

export default router;
