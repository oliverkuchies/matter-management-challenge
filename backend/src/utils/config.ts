import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SLA_THRESHOLD_HOURS: z.string().transform(Number).default('8'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
  throw new Error(`Invalid environment variables: ${JSON.stringify(parsedConfig.error.format())}`);
}

const config = parsedConfig.data;

export { config };


