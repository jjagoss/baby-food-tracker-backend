import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Child } from "../entities/Child";
import { FoodEntry } from "../entities/FoodEntry";
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });

console.log('Available environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Not present',
  // Log other relevant variables but mask sensitive data
});

const getDbConfig = () => {
  // If DATABASE_URL is present (Render production environment)
  if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL for connection');
    const dbUrl = new URL(process.env.DATABASE_URL);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port),
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1) // Remove leading '/'
    };
  }

  console.log('Using local database configuration');
  
  // Test environment
  if (process.env.NODE_ENV === 'test') {
    return {
      host: 'localhost',
      port: 5436,
      database: 'baby_food_tracker_test',
      username: 'postgres',
      password: 'postgres'
    };
  }

  // Development environment (fallback)
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || "5435"),
    database: process.env.DB_NAME || 'baby_food_tracker',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  };
};

const config = getDbConfig();

console.log('Selected database configuration:', {
  environment: process.env.NODE_ENV,
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username,
  usingSSL: !!process.env.DATABASE_URL
});

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, // Add direct URL support
  ...(!process.env.DATABASE_URL ? {
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
  } : {}),
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Child, FoodEntry],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
  subscribers: [],
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});