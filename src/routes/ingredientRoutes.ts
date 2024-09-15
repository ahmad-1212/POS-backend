import { Router } from "express";
import {
  addIngredient,
  deletIngredient,
  getAllIngredients,
  updateIngredient,
} from "../controllers/ingredientController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);
router.route("/").get(getAllIngredients).post(addIngredient);
router.route("/:id").patch(updateIngredient).delete(deletIngredient);

export default router;
