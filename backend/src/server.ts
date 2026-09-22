import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config/env';
import { testConnection } from './config/db';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security and utility middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or any local/preview origin
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('10.') || origin.includes('192.168.') || origin.includes('172.') || origin.includes('airoapp.ai') || origin === config.frontendUrl) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter for API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});
app.use('/api', limiter);

// Mount main API routes
app.use('/api', apiRouter);

// Serve static frontend assets in production if available
const possibleStaticDirs = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, 'public'),
];

let staticServed = false;
for (const dir of possibleStaticDirs) {
  if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
    app.use(express.static(dir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(dir, 'index.html'));
    });
    staticServed = true;
    break;
  }
}

// Global Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('⚠️ Could not connect to MySQL on configured port. Check database credentials in .env.');
  }

  app.listen(config.port, () => {
    console.log(`🚀 NexaLink CRM Server running at http://localhost:${config.port}`);
    console.log(`📡 API endpoints at http://localhost:${config.port}/api`);
    if (staticServed) {
      console.log(`🌐 Static frontend UI served directly by Express`);
    }
  });
}

startServer();

