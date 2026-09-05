/** DB 연결 헬퍼. TypeORM DataSource는 프로세스당 하나. */

import type { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";
import { getServerEnv } from "@/src/lib/env";
import { isTransientDbError } from "./pg-error";

let connecting: Promise<DataSource> | null = null;

async function connect(): Promise<DataSource> {
  if (AppDataSource.isInitialized) return AppDataSource;
  if (connecting) return connecting;

  connecting = AppDataSource.initialize().catch((error: unknown) => {
    connecting = null;
    if (AppDataSource.isInitialized) return AppDataSource;
    throw error;
  });

  return connecting;
}

async function reconnect(): Promise<DataSource> {
  connecting = null;
  if (AppDataSource.isInitialized) {
    try {
      await AppDataSource.destroy();
    } catch {
      // 이미 끊긴 연결
    }
  }
  return connect();
}

export async function initializeDatabase(): Promise<DataSource> {
  getServerEnv();
  return connect();
}

/** 끊긴 풀에서 쿼리가 실패하면 한 번 재연결 후 다시 실행한다. */
export async function withDatabase<T>(
  operation: (dataSource: DataSource) => Promise<T>
): Promise<T> {
  try {
    return await operation(await initializeDatabase());
  } catch (error) {
    if (!isTransientDbError(error)) throw error;
    return operation(await reconnect());
  }
}
