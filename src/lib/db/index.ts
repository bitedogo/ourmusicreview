import { AppDataSource } from "./data-source";

let isInitialized = false;

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  if (!isInitialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    isInitialized = true;
  }

  return AppDataSource;
}

export function getDataSource() {
  if (!AppDataSource.isInitialized) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return AppDataSource;
}
