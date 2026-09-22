"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Security and utility middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server) or any local/preview origin
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('10.') || origin.includes('192.168.') || origin.includes('172.') || origin.includes('airoapp.ai') || origin === env_1.config.frontendUrl) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Serve uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Rate Limiter for API
const limiter = (0, express_rate_limit_1.default)({
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
app.use('/api', routes_1.apiRouter);
// Serve static frontend assets in production if available
const possibleStaticDirs = [
    path_1.default.join(__dirname, '../public'),
    path_1.default.join(__dirname, '../../frontend/dist'),
    path_1.default.join(__dirname, 'public'),
];
let staticServed = false;
for (const dir of possibleStaticDirs) {
    if (fs_1.default.existsSync(dir) && fs_1.default.existsSync(path_1.default.join(dir, 'index.html'))) {
        app.use(express_1.default.static(dir));
        app.get('*', (req, res, next) => {
            if (req.path.startsWith('/api')) {
                return next();
            }
            res.sendFile(path_1.default.join(dir, 'index.html'));
        });
        staticServed = true;
        break;
    }
}
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Start Server
async function startServer() {
    const dbConnected = await (0, db_1.testConnection)();
    if (!dbConnected) {
        console.error('⚠️ Could not connect to MySQL on configured port. Check database credentials in .env.');
    }
    app.listen(env_1.config.port, () => {
        console.log(`🚀 NexaLink CRM Server running at http://localhost:${env_1.config.port}`);
        console.log(`📡 API endpoints at http://localhost:${env_1.config.port}/api`);
        if (staticServed) {
            console.log(`🌐 Static frontend UI served directly by Express`);
        }
    });
}
startServer();
