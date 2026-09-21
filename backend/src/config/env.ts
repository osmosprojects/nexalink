import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || '5000',
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nexalink_crm',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  },

  jwtSecret: process.env.JWT_SECRET || 'nexalink_crm_super_secure_jwt_secret_key_2026_antigravity',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  aiProvider: process.env.AI_PROVIDER || 'built_in',
  aiApiKey: process.env.AI_API_KEY || '',
};
