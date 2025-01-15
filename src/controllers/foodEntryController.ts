import { Response } from "express";
import { AppDataSource } from "../config/database";
import { FoodEntry } from "../entities/FoodEntry";
import { Child } from "../entities/Child";
import { AuthRequest } from "../middleware/auth";

export const createFoodEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { childId, foodId, triedDate, notes } = req.body;

    // Validate required fields
    if (!childId || !foodId || !triedDate) {
      return res.status(400).json({ 
        message: "Child ID, food ID, and tried date are required" 
      });
    }

    // Check if child exists and belongs to user
    const childRepository = AppDataSource.getRepository(Child);
    const child = await childRepository.findOne({
      where: { 
        id: childId,
        user: { id: req.user.id }
      }
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const foodEntryRepository = AppDataSource.getRepository(FoodEntry);
    const foodEntry = foodEntryRepository.create({
      foodId,
      triedDate: new Date(triedDate),
      notes,
      child: { id: childId }
    });

    await foodEntryRepository.save(foodEntry);
    res.status(201).json(foodEntry);
  } catch (error) {
    console.error("Error creating food entry:", error);
    res.status(500).json({ message: "Error creating food entry" });
  }
};

export const getFoodEntries = async (req: AuthRequest, res: Response) => {
  try {
    const { childId } = req.params;

    // Check if child belongs to user
    const childRepository = AppDataSource.getRepository(Child);
    const child = await childRepository.findOne({
      where: { 
        id: childId,
        user: { id: req.user.id }
      }
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const foodEntryRepository = AppDataSource.getRepository(FoodEntry);
    const foodEntries = await foodEntryRepository.find({
      where: { child: { id: childId } },
      order: { triedDate: 'DESC' }
    });

    res.json(foodEntries);
  } catch (error) {
    console.error("Error fetching food entries:", error);
    res.status(500).json({ message: "Error fetching food entries" });
  }
};

export const updateFoodEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const foodEntryRepository = AppDataSource.getRepository(FoodEntry);
    const foodEntry = await foodEntryRepository.findOne({
      where: { id },
      relations: ['child', 'child.user']
    });

    if (!foodEntry) {
      return res.status(404).json({ message: "Food entry not found" });
    }

    if (foodEntry.child.user.id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this food entry" });
    }

    foodEntry.notes = notes;
    await foodEntryRepository.save(foodEntry);
    res.json(foodEntry);
  } catch (error) {
    console.error("Error updating food entry:", error);
    res.status(500).json({ message: "Error updating food entry" });
  }
};

export const deleteFoodEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const foodEntryRepository = AppDataSource.getRepository(FoodEntry);
    const foodEntry = await foodEntryRepository.findOne({
      where: { id },
      relations: ['child', 'child.user']
    });

    if (!foodEntry) {
      return res.status(404).json({ message: "Food entry not found" });
    }

    if (foodEntry.child.user.id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this food entry" });
    }

    await foodEntryRepository.remove(foodEntry);
    res.json({ message: "Food entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting food entry:", error);
    res.status(500).json({ message: "Error deleting food entry" });
  }
};