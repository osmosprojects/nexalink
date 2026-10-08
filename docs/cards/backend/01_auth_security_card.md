# Backend Card: Auth & Security Module Card

## 1. Overview
The **Auth & Security Module** manages user registration, credential authentication, 1-Click demo authentication, session token issuing via HttpOnly cookies, password hashing with Bcrypt, IP-level rate limiting, and structured audit trail logging.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/AuthController.ts`
  - Repository: `backend/src/repositories/UserRepository.ts`
  - Middleware: `backend/src/middleware/auth.ts`, `backend/src/middleware/audit.ts`
  - Database Tables: `users`, `oauth_accounts`, `audit_logs`

---

## 2. API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new account with email & password |
| `POST` | `/api/auth/login` | Public | Authenticate email/password, issue JWT cookie |
| `POST` | `/api/auth/demo-login` | Public | Instant 1-click access as demo user |
| `POST` | `/api/auth/google` | Public | OAuth 2.0 Google token exchange |
| `GET` | `/api/auth/me` | Protected | Validate current session and return user profile |
| `POST` | `/api/auth/logout` | Protected | Clear auth cookie |

---

## 3. Core Implementation & Code Logic

```typescript
// Token Generation & Cookie Dispatch (AuthController.ts)
const token = jwt.sign(
  { userId: user.user_id, email: user.email },
  config.jwtSecret,
  { expiresIn: '7d' }
);

res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

```typescript
// Auth Verification Middleware (middleware/auth.ts)
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: number; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired session token', 401, 'INVALID_TOKEN');
  }
}
```

---

## 4. Security Rules & Protections

1. **Password Encryption:** Bcrypt salt rounds = 10 (`bcrypt.hash(password, 10)`).
2. **HttpOnly Cookie:** Prohibits XSS access to JWT token via browser JavaScript.
3. **Rate Limiting:** `express-rate-limit` enforces 1000 requests per 15-minute window per IP.
4. **Audit Logging:** Every state change emits an asynchronous entry to `audit_logs` capturing `user_id`, `action`, `resource_type`, `resource_id`, and client IP.
