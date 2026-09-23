"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserRepository_1 = require("../repositories/UserRepository");
const ProfileRepository_1 = require("../repositories/ProfileRepository");
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const response_1 = require("../helpers/response");
const audit_1 = require("../middleware/audit");
class AuthController {
    static async register(req, res, next) {
        try {
            const { email, password, displayName } = req.body;
            if (!email || !password || !displayName) {
                return (0, response_1.sendError)(res, 'Email, password, and display name are required', 400);
            }
            const existing = await UserRepository_1.UserRepository.findByEmail(email);
            if (existing) {
                return (0, response_1.sendError)(res, 'An account with this email already exists', 409, 'EMAIL_EXISTS');
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const userId = await UserRepository_1.UserRepository.create({
                email,
                passwordHash,
                displayName,
            });
            // Initialize default profile and persona
            await ProfileRepository_1.ProfileRepository.upsertProfile(userId, {
                headline: 'Professional & Builder',
                bio: 'Welcome to NexaLink CRM!',
            });
            await ProfileRepository_1.ProfileRepository.upsertPersona(userId, {
                persona_name: 'Strategic Networker',
                communication_style: 'Concise & Strategic',
            });
            const token = jsonwebtoken_1.default.sign({ userId, email, displayName }, env_1.config.jwtSecret, { expiresIn: '7d' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: env_1.config.nodeEnv === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            await (0, audit_1.logAudit)(req, 'USER_REGISTERED', 'user', userId);
            const isComplete = await ProfileRepository_1.ProfileRepository.isProfileComplete(userId);
            return (0, response_1.sendSuccess)(res, {
                user: { userId, email, displayName, avatarUrl: null },
                token,
                isProfileComplete: isComplete,
            }, 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return (0, response_1.sendError)(res, 'Email and password are required', 400);
            }
            const user = await UserRepository_1.UserRepository.findByEmail(email);
            if (!user || !user.password_hash) {
                return (0, response_1.sendError)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
            }
            const match = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!match) {
                return (0, response_1.sendError)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.user_id, email: user.email, displayName: user.display_name }, env_1.config.jwtSecret, { expiresIn: '7d' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: env_1.config.nodeEnv === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            await (0, audit_1.logAudit)(req, 'USER_LOGIN', 'user', user.user_id);
            const isComplete = await ProfileRepository_1.ProfileRepository.isProfileComplete(user.user_id);
            return (0, response_1.sendSuccess)(res, {
                user: {
                    userId: user.user_id,
                    email: user.email,
                    displayName: user.display_name,
                    avatarUrl: user.avatar_url,
                },
                token,
                isProfileComplete: isComplete,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async demoLogin(req, res, next) {
        try {
            const users = await (0, db_1.query)('SELECT * FROM users WHERE status = ? ORDER BY user_id ASC LIMIT 1', ['active']);
            const user = users && users.length > 0 ? users[0] : null;
            if (!user) {
                return (0, response_1.sendError)(res, 'No active user account found in database.', 404);
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.user_id, email: user.email, displayName: user.display_name }, env_1.config.jwtSecret, { expiresIn: '7d' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: env_1.config.nodeEnv === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            await (0, audit_1.logAudit)(req, 'DEMO_LOGIN', 'user', user.user_id);
            const isComplete = await ProfileRepository_1.ProfileRepository.isProfileComplete(user.user_id);
            return (0, response_1.sendSuccess)(res, {
                user: {
                    userId: user.user_id,
                    email: user.email,
                    displayName: user.display_name,
                    avatarUrl: user.avatar_url,
                },
                token,
                isProfileComplete: isComplete,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async me(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await UserRepository_1.UserRepository.findById(userId);
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404);
            }
            const profile = await ProfileRepository_1.ProfileRepository.getProfileByUserId(userId);
            const persona = await ProfileRepository_1.ProfileRepository.getPersonaByUserId(userId);
            const isComplete = await ProfileRepository_1.ProfileRepository.isProfileComplete(userId);
            return (0, response_1.sendSuccess)(res, {
                user: {
                    userId: user.user_id,
                    email: user.email,
                    displayName: user.display_name,
                    avatarUrl: user.avatar_url,
                    status: user.status,
                    createdAt: user.created_at,
                },
                profile,
                persona,
                isProfileComplete: isComplete,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async googleAuth(req, res, next) {
        try {
            const { credential, token, googleUser } = req.body;
            let email = googleUser?.email;
            let displayName = googleUser?.name || googleUser?.displayName;
            let avatarUrl = googleUser?.picture || googleUser?.avatarUrl;
            // Verify Google ID token if provided
            const idToken = credential || token;
            if (idToken) {
                try {
                    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
                    if (googleRes.ok) {
                        const payload = await googleRes.json();
                        if (payload.email) {
                            email = payload.email;
                            displayName = payload.name || payload.given_name || displayName;
                            avatarUrl = payload.picture || avatarUrl;
                        }
                    }
                }
                catch (verifyErr) {
                    console.warn('Google id_token validation fallback to payload:', verifyErr);
                }
            }
            if (!email || typeof email !== 'string') {
                return (0, response_1.sendError)(res, 'Google authentication failed: Valid email required', 400);
            }
            let user = await UserRepository_1.UserRepository.findByEmail(email);
            if (!user) {
                const userId = await UserRepository_1.UserRepository.create({
                    email,
                    passwordHash: null,
                    displayName: displayName || email.split('@')[0],
                });
                if (avatarUrl) {
                    await (0, db_1.query)('UPDATE users SET avatar_url = ? WHERE user_id = ?', [avatarUrl, userId]);
                }
                await ProfileRepository_1.ProfileRepository.upsertProfile(userId, {
                    headline: 'Professional Networker',
                    bio: 'Welcome to NexaLink CRM!',
                    avatar_url: avatarUrl || null,
                });
                await ProfileRepository_1.ProfileRepository.upsertPersona(userId, {
                    persona_name: 'Strategic Networker',
                    communication_style: 'Concise & Strategic',
                });
                user = await UserRepository_1.UserRepository.findById(userId);
            }
            else {
                if (avatarUrl && !user.avatar_url) {
                    await (0, db_1.query)('UPDATE users SET avatar_url = ? WHERE user_id = ?', [avatarUrl, user.user_id]);
                    user.avatar_url = avatarUrl;
                }
                if (displayName && user.display_name !== displayName) {
                    await (0, db_1.query)('UPDATE users SET display_name = ? WHERE user_id = ?', [displayName, user.user_id]);
                    user.display_name = displayName;
                }
            }
            if (!user) {
                return (0, response_1.sendError)(res, 'User account creation or fetch failed', 500);
            }
            const jwtToken = jsonwebtoken_1.default.sign({ userId: user.user_id, email: user.email, displayName: user.display_name }, env_1.config.jwtSecret, { expiresIn: '7d' });
            res.cookie('token', jwtToken, {
                httpOnly: true,
                secure: env_1.config.nodeEnv === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            await (0, audit_1.logAudit)(req, 'GOOGLE_OAUTH_LOGIN', 'user', user.user_id);
            const isComplete = await ProfileRepository_1.ProfileRepository.isProfileComplete(user.user_id);
            return (0, response_1.sendSuccess)(res, {
                user: {
                    userId: user.user_id,
                    email: user.email,
                    displayName: user.display_name,
                    avatarUrl: user.avatar_url,
                },
                token: jwtToken,
                isProfileComplete: isComplete,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async logout(req, res, next) {
        try {
            res.clearCookie('token');
            await (0, audit_1.logAudit)(req, 'USER_LOGOUT', 'user', req.user?.userId || null);
            return (0, response_1.sendSuccess)(res, { message: 'Logged out successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
