import { Router } from "express";
import {
  getKitchenItems,
  sendToMainInventory,
} from "../controllers/kitchenController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);
router.get("/", getKitchenItems);
router.post("/transfer", sendToMainInventory);

export default router;
