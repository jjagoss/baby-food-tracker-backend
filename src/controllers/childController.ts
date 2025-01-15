// src/controllers/childController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Child } from "../entities/Child";
import { AuthRequest } from "../middleware/auth";

export const createChild = async (req: AuthRequest, res: Response) => {
  try {
    const { name, dateOfBirth } = req.body;

    // Validate required fields
    if (!name || !dateOfBirth) {
      return res.status(400).json({ 
        message: "Name and date of birth are required" 
      });
    }

    const childRepository = AppDataSource.getRepository(Child);
    
    const child = childRepository.create({
      name,
      dateOfBirth: new Date(dateOfBirth),
      user: { id: req.user.id }
    });

    await childRepository.save(child);
    res.status(201).json(child);
  } catch (error) {
    console.error("Error creating child:", error);
    res.status(500).json({ message: "Error creating child" });
  }
};

export const getChildren = async (req: AuthRequest, res: Response) => {
  try {
    const childRepository = AppDataSource.getRepository(Child);
    
    const children = await childRepository.find({
      where: { user: { id: req.user.id } },
      relations: ["foodEntries"]
    });

    res.json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ message: "Error fetching children" });
  }
};

export const getChild = async (req: AuthRequest, res: Response) => {
  try {
    // Check if the ID is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(404).json({ message: "Child not found" });
    }

    const childRepository = AppDataSource.getRepository(Child);
    
    const child = await childRepository.findOne({
      where: { 
        id: req.params.id,
        user: { id: req.user.id }
      },
      relations: ["foodEntries"]
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.json(child);
  } catch (error) {
    console.error("Error fetching child:", error);
    res.status(500).json({ message: "Error fetching child" });
  }
};

export const deleteChild = async (req: AuthRequest, res: Response) => {
  try {
    const childRepository = AppDataSource.getRepository(Child);

    const child = await childRepository.findOne({
      where: { 
        id: req.params.id,
        user: { id: req.user.id }
      }
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    await childRepository.remove(child);
    res.json({ message: "Child deleted successfully" });
  } catch (error) {
    console.error("Error deleting child:", error);
    res.status(500).json({ message: "Error deleting child" });
  }
};