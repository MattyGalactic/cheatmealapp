import { Pool } from "pg";
import { env } from "../config/env.js";

export const pool = env.DATABASE_URL
  ? new Pool({ connectionString: env.DATABASE_URL })
  : null;
