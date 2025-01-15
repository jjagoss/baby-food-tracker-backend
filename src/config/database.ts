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
  TEST_DB_HOST,
  TEST_DB_PORT,
  TEST_DB_USER,
  TEST_DB_PASSWORD,
  TEST_DB_NAME
} = process.env;

const getDbConfig = () => {
  if (NODE_ENV === 'test') {
    return {
      host: TEST_DB_HOST || 'localhost',
      port: parseInt(TEST_DB_PORT || "5436"),
      database: TEST_DB_NAME || 'baby_food_tracker_test',
      username: TEST_DB_USER || 'postgres',
      password: TEST_DB_PASSWORD || 'postgres'
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
  synchronize: NODE_ENV === 'test',
  logging: NODE_ENV === 'development',
  entities: [User, Child, FoodEntry],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
  subscribers: []
});