import dotenv from 'dotenv';

import { isTestEnv } from './utils/isTestEnv';

dotenv.config();

interface Config {
  NODE_ENV: string;
  LOG_LEVEL: string;
  ADMIN_AUTH_KEY: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  SAAS_CLIENT_URL: string;
  PROVE_SAAS_URL: string;
  PROVE_USERNAME: string;
  PROVE_PASSWORD: string;
}

const {
  NODE_ENV = 'development',
  LOG_LEVEL = 'debug',
  ADMIN_AUTH_KEY = '',
  DB_NAME = '',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = '',
  DB_PASSWORD = '',
  SAAS_CLIENT_URL = '',
  PROVE_SAAS_URL = '',
  PROVE_USERNAME = '',
  PROVE_PASSWORD = '',
  TEST_DB_NAME = '',
  TEST_DB_HOST = 'localhost',
  TEST_DB_PORT = '5432',
  TEST_DB_USER = '',
  TEST_DB_PASSWORD = ''
} = process.env;

const dbConfig = isTestEnv(NODE_ENV)
  ? {
      DB_NAME: TEST_DB_NAME,
      DB_HOST: TEST_DB_HOST,
      DB_PORT: parseInt(TEST_DB_PORT, 10),
      DB_USER: TEST_DB_USER,
      DB_PASSWORD: TEST_DB_PASSWORD
    }
  : {
      DB_NAME,
      DB_HOST,
      DB_PORT: parseInt(DB_PORT, 10),
      DB_USER,
      DB_PASSWORD
    };

export const config: Config = {
  NODE_ENV,
  LOG_LEVEL,
  ADMIN_AUTH_KEY,
  SAAS_CLIENT_URL,
  PROVE_SAAS_URL,
  PROVE_USERNAME,
  PROVE_PASSWORD,
  ...dbConfig
};
