import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  login,
  logout,
  register,
} from "../controllers/userController";
import { protect } from "../middlewares/protect";
import { restrictTo } from "../middlewares/restrictTo";

const router = Router();

router.post("/login", login);
// Protected routes
router.use(protect);
router.post("/register", restrictTo("admin", "manager"), register);
router.delete("/:id", restrictTo("admin", "manager"), deleteUser);
router.get("/me", getUser);
router.get("/", getAllUsers);
router.post("/logout", logout);

export default router;
