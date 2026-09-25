"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../config/env");
async function runMigrations() {
    console.log('🔄 Running database migrations on:', env_1.config.db.database);
    // Create database connection
    const connection = await promise_1.default.createConnection({
        host: env_1.config.db.host,
        port: env_1.config.db.port,
        user: env_1.config.db.user,
        password: env_1.config.db.password,
        multipleStatements: true,
    });
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env_1.config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.query(`USE \`${env_1.config.db.database}\`;`);
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
        await connection.query(schemaSql);
        // Apply column updates to existing databases
        try {
            await connection.query(`ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL;`);
            await connection.query(`ALTER TABLE user_profiles MODIFY COLUMN avatar_url LONGTEXT NULL;`);
        }
        catch (e) {
            // Ignore if table/column does not exist yet
        }
        console.log('✅ Migrations applied successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
    finally {
        await connection.end();
    }
}
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
