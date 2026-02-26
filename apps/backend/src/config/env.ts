import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  SEARCH_RADIUS_MILES: z.coerce.number().default(10),
  PILOT_CITY: z.string().default("Nashville"),
  PILOT_STATE: z.string().default("TN"),
});

export const env = envSchema.parse(process.env);
