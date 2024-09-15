import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/categoryController";
import { protect } from "../middlewares/protect";
import { imageUploader } from "../middlewares/imageUploader";
import { resizeImage } from "../middlewares/resizeImage";

const router = Router();

router.use(protect);
router.get("/", getAllCategories);
router.post("/", imageUploader.single("image"), resizeImage, addCategory);
router.patch(
  "/:id",
  imageUploader.single("image"),
  resizeImage,
  updateCategory
);
router.delete("/:id", deleteCategory);

export default router;
