import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config/env';
import { testConnection } from './config/db';
import { runMigrations } from './database/migrate';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';

// Import Matchmaking Cron
const { initMatchmakingCron } = require('./jobs/matchmakingCron');

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

// Serve uploads directory from all possible build/runtime candidate paths
const possibleUploadDirs = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'public/uploads'),
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../../uploads'),
  path.join(__dirname, '../public/uploads'),
  path.join(__dirname, '../../public/uploads'),
];

for (const dir of possibleUploadDirs) {
  app.use('/uploads', express.static(dir));
}

// Cache Control Middleware for API routes to prevent stale API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});

// App version check endpoint
app.get('/api/version', (_req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.2.0',
      timestamp: Date.now(),
    },
  });
});

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
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../public'),
  path.join(__dirname, 'public'),
];

let staticServed = false;
for (const dir of possibleStaticDirs) {
  if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
    app.use(
      express.static(dir, {
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          } else if (filePath.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
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
  if (dbConnected) {
    try {
      await runMigrations();
    } catch (migErr) {
      console.warn('⚠️ Auto migration notice:', migErr);
    }

    try {
      if (typeof initMatchmakingCron === 'function') {
        initMatchmakingCron();
      }
    } catch (cronErr) {
      console.warn('⚠️ Matchmaking cron notice:', cronErr);
    }
  } else {
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
