import { Router } from "express";
import { createTable, getTables } from "../controllers/tableController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);
router.route("/").get(getTables).post(createTable);
router.patch("/:id");

export default router;
