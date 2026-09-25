"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.withTransaction = withTransaction;
exports.testConnection = testConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
exports.pool = promise_1.default.createPool(env_1.config.db);
async function query(sql, params) {
    const [rows] = await exports.pool.execute(sql, params);
    return rows;
}
async function withTransaction(callback) {
    const connection = await exports.pool.getConnection();
    await connection.beginTransaction();
    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
async function testConnection() {
    try {
        const connection = await exports.pool.getConnection();
        await connection.ping();
        // Ensure avatar_url column can hold Base64 image data without truncation
        try {
            await connection.query(`ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL`);
            await connection.query(`ALTER TABLE user_profiles MODIFY COLUMN avatar_url LONGTEXT NULL`);
        }
        catch {
            // Ignore if table/column does not exist yet or already altered
        }
        connection.release();
        console.log('✅ Connected to MySQL Database:', env_1.config.db.database);
        return true;
    }
    catch (error) {
        console.error('❌ Failed to connect to MySQL Database:', error);
        return false;
    }
}
