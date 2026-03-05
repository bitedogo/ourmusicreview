import { AppDataSource } from "./data-source";
import { getServerEnv } from "@/src/lib/env";

let isInitialized = false;

export async function initializeDatabase() {
  getServerEnv();

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
