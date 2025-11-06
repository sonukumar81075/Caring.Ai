import express from "express";
import rateLimit from "express-rate-limit";
import { 
    login, 
    signUp, 
    verify, 
    logout, 
    getCurrentUser, 
    generateTestToken, 
    forgotPassword, 
    resetPassword,
    setupTwoFactor,
    verifyAndEnableTwoFactor,
    disableTwoFactor,
    getTwoFactorStatus,
    getLoginHistory,
    changePassword
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { authAuditLogger, auditLogger } from "../middleware/auditLogger.js";
import { createRateLimit, sanitizeRequest } from "../middleware/security.js";

const userRoute = express.Router();

// Enhanced rate limiting for login attempts
const loginLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // max 5 requests
    "Too many login attempts. Try again after 15 minutes."
);

// Enhanced rate limiting for signup attempts
const signupLimiter = createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // max 3 signup attempts per hour
    "Too many signup attempts. Try again after 1 hour."
);

// Rate limiting for verification attempts
const verifyLimiter = createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // max 10 verification attempts per hour
    "Too many verification attempts. Try again after 1 hour."
);

// Apply sanitization middleware to all routes
userRoute.use(sanitizeRequest);

// Put verify route first to avoid any conflicts
userRoute.get("/verify/:token", verifyLimiter, authAuditLogger(), verify);

// Public routes with audit logging
userRoute.post("/signup", signupLimiter, authAuditLogger(), signUp);
userRoute.post("/login",loginLimiter, authAuditLogger(), login);

// Test route to verify routing is working
userRoute.get("/test", (req, res) => {
    res.json({ message: "User routes are working!", timestamp: new Date().toISOString() });
});

// Protected routes with audit logging
userRoute.post("/logout", authenticate, authAuditLogger(), logout);
userRoute.get("/me", authenticate, auditLogger('USER_PROFILE_VIEW', 'USER'), getCurrentUser);

// Password reset routes
const passwordResetLimiter = createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // max 3 reset attempts per hour
    "Too many password reset attempts. Try again after 1 hour."
);

userRoute.post("/forgot-password", passwordResetLimiter, authAuditLogger(), forgotPassword);
userRoute.post("/reset-password/:token", passwordResetLimiter, authAuditLogger(), resetPassword);

// Development test route
userRoute.post("/generate-test-token", generateTestToken);

// 2FA routes with rate limiting
const twoFactorLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // max 10 2FA attempts per 15 minutes
    "Too many 2FA attempts. Try again after 15 minutes."
);

userRoute.post("/2fa/setup", authenticate, twoFactorLimiter, auditLogger('2FA_SETUP', 'SECURITY'), setupTwoFactor);
userRoute.post("/2fa/verify", authenticate, twoFactorLimiter, auditLogger('2FA_VERIFY', 'SECURITY'), verifyAndEnableTwoFactor);
userRoute.post("/2fa/disable", authenticate, twoFactorLimiter, auditLogger('2FA_DISABLE', 'SECURITY'), disableTwoFactor);
userRoute.get("/2fa/status", authenticate, auditLogger('2FA_STATUS_VIEW', 'SECURITY'), getTwoFactorStatus);
userRoute.get("/login-history", authenticate, auditLogger('LOGIN_HISTORY_VIEW', 'SECURITY'), getLoginHistory);

// Password change route with rate limiting
const passwordChangeLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    3, // max 3 password change attempts per 15 minutes
    "Too many password change attempts. Try again after 15 minutes."
);

userRoute.post("/change-password", authenticate, passwordChangeLimiter, auditLogger('PASSWORD_CHANGE', 'SECURITY'), changePassword);

export default userRoute;