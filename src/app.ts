import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import userRoutes from "./routes/userRoutes";
import childRoutes from "./routes/childRoutes";
import foodEntryRoutes from "./routes/foodEntryRoutes";

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/users", userRoutes);
  app.use("/api/children", childRoutes);
  app.use("/api/food-entries", foodEntryRoutes);

  return app;
};

export const app = createApp();

export const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  
  try {
    await AppDataSource.initialize();
    console.log("Database connected");
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

// Only start the server if this file is being run directly
if (require.main === module) {
  startServer();
}