import { AppDataSource } from "../../config/database";
import { User } from "../../entities/User";
import { Child } from "../../entities/Child";
import { FoodEntry } from "../../entities/FoodEntry";
import { Repository } from "typeorm";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Initialize test environment
export const initializeTestEnvironment = async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret';
  
  try {
    // If there's an existing connection, close it
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    // Initialize new connection
    await AppDataSource.initialize();
    
    // Drop and recreate schema
    await AppDataSource.synchronize(true);
    
    console.log('Test environment initialized');
  } catch (error) {
    console.error('Error initializing test environment:', error);
    throw error;
  }
};

// Clear all test data
export const clearTestData = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    // Drop and recreate all tables
    await AppDataSource.synchronize(true);
    
    console.log('Test data cleared');
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error;
  }
};

// Close test connection
export const closeTestConnection = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Test connection closed');
    }
  } catch (error) {
    console.error('Error closing test connection:', error);
    throw error;
  }
};

// Helper to create a test user
export const createTestUser = async (
  email: string = 'test@example.com',
  password: string = 'password123'
): Promise<{ user: User; token: string }> => {
  const userRepository = AppDataSource.getRepository(User);
  
  const hashedPassword = await bcrypt.hash(password, 8);
  const user = await userRepository.save(
    userRepository.create({
      email,
      password: hashedPassword
    })
  );

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
  
  return { user, token };
};

// Helper to create a test child
export const createTestChild = async (
  userId: string,
  name: string = 'Test Child',
  dateOfBirth: Date = new Date('2023-01-01')
): Promise<Child> => {
  const childRepository = AppDataSource.getRepository(Child);
  
  return await childRepository.save(
    childRepository.create({
      name,
      dateOfBirth,
      user: { id: userId }
    })
  );
};

// Helper to create a test food entry
export const createTestFoodEntry = async (
  childId: string,
  foodId: number = 1,
  triedDate: Date = new Date(),
  notes: string = 'Test notes'
): Promise<FoodEntry> => {
  const foodEntryRepository = AppDataSource.getRepository(FoodEntry);
  
  return await foodEntryRepository.save(
    foodEntryRepository.create({
      foodId,
      triedDate,
      notes,
      child: { id: childId }
    })
  );
};