import dotenv from 'dotenv';

dotenv.config();

interface Config {
  NODE_ENV: string;
}

const {
  NODE_ENV = 'development'
} = process.env;

export const config: Config = {
  NODE_ENV
};
