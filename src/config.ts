import dotenv from 'dotenv';

dotenv.config();

interface Config {
  NODE_ENV: string;
  PAPERTRAIL_PORT: number;
  LOG_LEVEL: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
}

const {
  NODE_ENV = 'development',
  PAPERTRAIL_PORT = '',
  LOG_LEVEL = 'debug',
  DB_NAME = '',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = '',
  DB_PASSWORD = ''
} = process.env;

export const config: Config = {
  NODE_ENV,
  PAPERTRAIL_PORT: parseInt(PAPERTRAIL_PORT, 10),
  LOG_LEVEL,
  DB_NAME,
  DB_HOST,
  DB_PORT: parseInt(DB_PORT, 10),
  DB_USER,
  DB_PASSWORD
};
