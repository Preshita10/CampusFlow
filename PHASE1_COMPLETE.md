# Phase 1: Auth + RBAC + Roles + Departments - COMPLETE ✅

## What Was Implemented

### Backend Changes

1. **Prisma Schema Updates**
   - Added 7 roles: STUDENT, ADVISOR, PROFESSOR, DEPT_ADMIN, DEAN, SUPER_ADMIN
   - Added Department and Program models
   - Added passwordHash field to User
   - Added RefreshToken model for JWT refresh tokens
   - Updated RequestCategory to enum
   - Added ESCALATED status
   - Added prevHash and hash fields to AuditLog (for Phase 10)

2. **Authentication System**
   - JWT access tokens (15min expiry)
   - JWT refresh tokens (7 days expiry)
   - bcrypt password hashing
   - `/api/auth/register` - User registration
   - `/api/auth/login` - Login with email/password
   - `/api/auth/refresh` - Refresh access token
   - `/api/auth/logout` - Revoke refresh token
   - `/api/auth/me` - Get current user

3. **RBAC Middleware**
   - `authMiddleware` - Validates JWT and attaches user to request
   - `requireRole(...roles)` - Checks if user has one of the required roles
   - `requirePermission(permission)` - Checks specific permissions
   - Permission matrix for each role

4. **Security Enhancements**
   - Helmet.js for security headers
   - Rate limiting (100 requests per 15min per IP)
   - Request size limits (10MB)
   - CORS configuration

5. **Updated Routes**
   - All routes now use JWT authentication
   - Requests route updated for new roles
   - Metrics route updated for new roles

6. **Seed Data**
   - Creates 2 departments (CS, MATH)
   - Creates 2 programs
   - Creates 6 users (one for each role) with password hashes
   - Creates sample requests and audit logs

### Environment Variables Added

```env
JWT_SECRET=change-me-in-production-use-strong-secret
JWT_REFRESH_SECRET=change-me-refresh-in-production-use-strong-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Demo Credentials

- **Student**: student@gmu.edu / student123
- **Advisor**: advisor@gmu.edu / advisor123
- **Professor**: professor@gmu.edu / professor123
- **Dept Admin**: deptadmin@gmu.edu / deptadmin123
- **Dean**: dean@gmu.edu / dean123
- **Super Admin**: admin@gmu.edu / admin123

## Next Steps

To complete Phase 1, you need to:

1. **Run Migration**:
   ```bash
   cd backend
   npx prisma migrate dev --name phase1_auth_rbac
   ```

2. **Update Frontend** (separate task):
   - Update login page to call `/api/auth/login`
   - Store accessToken and refreshToken
   - Add token refresh logic
   - Update API client to send Bearer token
   - Update user context to use new auth

3. **Test**:
   ```bash
   # Test registration
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@gmu.edu","password":"test123"}'

   # Test login
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@gmu.edu","password":"student123"}'

   # Test protected route
   curl http://localhost:3001/api/requests \
     -H "Authorization: Bearer <access_token>"
   ```

## Files Changed

- `backend/prisma/schema.prisma` - Complete schema update
- `backend/src/index.ts` - Added security middleware, updated routes
- `backend/src/middleware/auth.ts` - Complete rewrite for JWT
- `backend/src/routes/auth.ts` - New authentication routes
- `backend/src/routes/requests.ts` - Updated for new roles
- `backend/src/routes/metrics.ts` - Updated for new roles
- `backend/src/utils/jwt.ts` - New JWT utilities
- `backend/src/utils/password.ts` - New password utilities
- `backend/src/services/auditService.ts` - Updated for new schema
- `backend/src/prisma/seed.ts` - Complete rewrite with departments/programs/users
- `backend/package.json` - Added dependencies (bcryptjs, jsonwebtoken, helmet, express-rate-limit)
- `docker-compose.yml` - Added JWT environment variables

## Files Removed

- `backend/src/routes/me.ts` - Replaced by `/api/auth/me`
