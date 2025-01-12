import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Child } from "../entities/Child";
import { FoodEntry } from "../entities/FoodEntry";
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const TestDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5436, // Docker test database port
  username: "postgres",
  password: "postgres",
  database: "baby_food_tracker_test",
  synchronize: true, // Keeping this true as per your current setup
  dropSchema: true, // This enables clean slate for each test run
  logging: false,
  entities: [User, Child, FoodEntry],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
  subscribers: []
});