import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'schoolmate_default_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  MAIL_HOST: process.env.MAIL_HOST || '',
  MAIL_PORT: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587,
  MAIL_USER: process.env.MAIL_USER || '',
  MAIL_PASS: process.env.MAIL_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || '',
};
