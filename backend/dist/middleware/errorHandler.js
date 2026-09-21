"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const response_1 = require("../helpers/response");
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
    if (err instanceof zod_1.ZodError) {
        const errorDetails = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return (0, response_1.sendError)(res, 'Validation failed for request data', 422, 'VALIDATION_ERROR', errorDetails);
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error occurred';
    const code = err.code || 'SERVER_ERROR';
    return (0, response_1.sendError)(res, message, statusCode, code);
}
