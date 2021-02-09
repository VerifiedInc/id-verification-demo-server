import dotenv from 'dotenv';

dotenv.config();

interface Config {
  NODE_ENV: string;
  PAPERTRAIL_PORT: number;
  LOG_LEVEL: string;
}

const {
  NODE_ENV = 'development',
  PAPERTRAIL_PORT = '',
  LOG_LEVEL = 'debug'
} = process.env;

export const config: Config = {
  NODE_ENV,
  PAPERTRAIL_PORT: parseInt(PAPERTRAIL_PORT, 10),
  LOG_LEVEL
};
