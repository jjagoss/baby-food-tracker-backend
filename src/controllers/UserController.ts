// src/controllers/userController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { TestDataSource } from "../config/test-database";
import { User } from "../entities/User";

const getDataSource = () => {
  return process.env.NODE_ENV === 'test' ? TestDataSource : AppDataSource;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    const userRepository = getDataSource().getRepository(User);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = userRepository.create({
      email,
      password: hashedPassword,
    });

    await userRepository.save(user);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'test_secret');
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    const userRepository = getDataSource().getRepository(User);

    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'test_secret');
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error logging in" });
  }
};