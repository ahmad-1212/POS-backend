import { Router } from "express";
import {
  addItemToMain,
  getMainInventory,
  sendToKitchen,
  updateItem,
} from "../controllers/mainInventoryController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);
router.get("/", getMainInventory);
router.post("/add", addItemToMain);
router.post("/transfer", sendToKitchen);
router.patch("/update", updateItem);

export default router;
