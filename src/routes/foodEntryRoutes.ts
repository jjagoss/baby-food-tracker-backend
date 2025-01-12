import { Router } from "express";
import { createFoodEntry, 
        getFoodEntries, 
        updateFoodEntry,
        deleteFoodEntry} from "../controllers/foodEntryController";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/", auth, createFoodEntry);
router.get("/child/:childId", auth, getFoodEntries);
router.patch("/:id", auth, updateFoodEntry);
router.delete("/:id", auth, deleteFoodEntry);

export default router;