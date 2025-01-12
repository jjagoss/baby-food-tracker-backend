import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Child } from "../entities/Child";
import { FoodEntry } from "../entities/FoodEntry";
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { 
  NODE_ENV,
  DB_HOST, 
  DB_PORT, 
  DB_USER, 
  DB_PASSWORD, 
  DB_NAME 
} = process.env;

const getDbConfig = () => {
  switch(NODE_ENV) {
    case 'production':
      return {
        host: DB_HOST || 'prod_db',
        port: parseInt(DB_PORT || "5432"),
        database: 'baby_food_tracker_prod',
        username: DB_USER,
        password: DB_PASSWORD
      };
    case 'test':
      return {
        host: 'localhost',
        port: 5436,
        database: 'baby_food_tracker_test',
        username: 'postgres',
        password: 'postgres'
      };
    default:
      return {
        host: 'localhost',
        port: 5435,
        database: 'baby_food_tracker',
        username: 'postgres',
        password: 'postgres'
      };
  }
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