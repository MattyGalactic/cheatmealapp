import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const schemaPath = path.resolve(repoRoot, "infra", "postgres", "schema.sql");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = await readFile(schemaPath, "utf8");
  const pool = new Pool({ connectionString });

  await pool.query(sql);
  await pool.end();

  console.log("Schema migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
