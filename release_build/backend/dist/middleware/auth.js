"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const response_1 = require("../helpers/response");
function authMiddleware(req, res, next) {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return (0, response_1.sendError)(res, 'Authentication required. Please sign in.', 401, 'UNAUTHORIZED');
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Invalid or expired session. Please sign in again.', 401, 'INVALID_TOKEN');
    }
}
