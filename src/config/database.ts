import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Child } from "../entities/Child";
import { FoodEntry } from "../entities/FoodEntry";
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { NODE_ENV, DATABASE_URL } = process.env;

console.log('Available environment variables:', {
  NODE_ENV,
  DATABASE_URL: DATABASE_URL ? 'Present' : 'Not present'
});

let config;

if (DATABASE_URL) {
  console.log('Using DATABASE_URL for connection');
  try {
    const dbUrl = new URL(DATABASE_URL);
    config = {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '5432'),
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1) // Remove leading '/'
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    throw error;
  }
} else {
  console.log('Using local database configuration');
  if (NODE_ENV === 'test') {
    config = {
      host: 'localhost',
      port: 5436,
      database: 'baby_food_tracker_test',
      username: 'postgres',
      password: 'postgres'
    };
  } else {
    config = {
      host: 'localhost',
      port: 5435,
      database: 'baby_food_tracker',
      username: 'postgres',
      password: 'postgres'
    };
  }
}

console.log('Selected database configuration:', {
  environment: NODE_ENV,
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username,
  usingSSL: !!DATABASE_URL
});

export const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL, // Use the full URL if available
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  synchronize: false,
  logging: NODE_ENV === "development",
  entities: [User, Child, FoodEntry],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
  subscribers: [],
  ssl: DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});