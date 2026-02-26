import { Pool } from "pg";
import { serverEnv } from "./env";

export const dbPool = serverEnv.DATABASE_URL
  ? new Pool({ connectionString: serverEnv.DATABASE_URL })
  : null;

