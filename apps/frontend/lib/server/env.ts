import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  SEARCH_RADIUS_MILES: z.coerce.number().default(10),
  PILOT_CITY: z.string().default("Nashville"),
  PILOT_STATE: z.string().default("TN"),
  NODE_ENV: z.string().optional(),
});

export const serverEnv = envSchema.parse(process.env);

