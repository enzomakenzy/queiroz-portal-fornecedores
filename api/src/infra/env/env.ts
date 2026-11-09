import z from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  PRISMA_LOG: z.enum(["query", "error", "warn", "info"]).default("error"),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;
