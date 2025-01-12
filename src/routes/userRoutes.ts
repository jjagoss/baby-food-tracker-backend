import { Router } from "express";
import { register, login } from "../controllers/UserController";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
// router.delete("/", auth, deleteUser)

export default router;