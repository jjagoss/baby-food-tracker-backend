import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Child } from "../entities/Child";
import { FoodEntry } from "../entities/FoodEntry";
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });

const { 
  NODE_ENV,
  DB_HOST, 
  DB_PORT, 
  DB_USER, 
  DB_PASSWORD, 
  DB_NAME,
  DATABASE_URL // Render provides this
} = process.env;

const getDbConfig = () => {
  if (process.env.DATABASE_URL) {
    // Parse the DATABASE_URL for Render deployment
    const dbUrl = new URL(process.env.DATABASE_URL);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port),
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1) // Remove leading '/'
    };
  }

  if (NODE_ENV === 'test') {
    return {
      host: 'localhost',
      port: 5436,
      database: 'baby_food_tracker_test',
      username: 'postgres',
      password: 'postgres'
    };
  }

  return {
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT || "5435"),
    database: DB_NAME || 'baby_food_tracker',
    username: DB_USER || 'postgres',
    password: DB_PASSWORD || 'postgres'
  };
};

const config = getDbConfig();

console.log('Database configuration:', {
  environment: NODE_ENV,
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username
});

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  synchronize: false, // Set to false for production
  logging: NODE_ENV === "development",
  entities: [User, Child, FoodEntry],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
  subscribers: [],
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // Enable SSL for Render
});