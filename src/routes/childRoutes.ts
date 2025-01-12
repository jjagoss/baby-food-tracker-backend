// src/routes/childRoutes.ts
import { Router } from "express";
import { 
  createChild, 
  getChildren, 
  getChild, 
  deleteChild 
} from "../controllers/childController";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/", auth, createChild);
router.get("/", auth, getChildren);
router.get("/:id", auth, getChild);
router.delete("/:id", auth, deleteChild);

export default router;