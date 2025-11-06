import express from "express";
import { 
    getDashboardStats, 
    getAllUsers, 
    createUser, 
    updateUser, 
    toggleUserStatus,
    getAdminActivityLogs,
    getUserTwoFactorStatus,
    enableUserTwoFactor,
    disableUserTwoFactor,
    getAllClinicReports
} from "../controllers/superAdminController.js";
import { authenticate } from "../middleware/auth.js";
import { auditLogger } from "../middleware/auditLogger.js";
import { sanitizeRequest } from "../middleware/security.js";

const router = express.Router();

// Middleware to check if user is SuperAdmin
const checkSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. SuperAdmin only.' 
        });
    }
    next();
};

// Apply authentication and SuperAdmin check to all routes
router.use(authenticate);
router.use(checkSuperAdmin);
router.use(sanitizeRequest);

// Dashboard statistics
router.get('/dashboard-stats', auditLogger('SUPERADMIN_DASHBOARD_VIEW', 'SUPERADMIN'), getDashboardStats);

// User management
router.get('/users', auditLogger('USER_MANAGEMENT_LIST', 'USER_MANAGEMENT'), getAllUsers);
router.post('/users', auditLogger('USER_MANAGEMENT_CREATE', 'USER_MANAGEMENT'), createUser);
router.patch('/users/:userId/toggle-status', auditLogger('USER_MANAGEMENT_STATUS_TOGGLE', 'USER_MANAGEMENT'), toggleUserStatus);
router.put('/users/:userId', auditLogger('USER_MANAGEMENT_UPDATE', 'USER_MANAGEMENT'), updateUser);

// Activity logs
router.get('/activity-logs', auditLogger('ACTIVITY_LOGS_VIEW', 'SUPERADMIN'), getAdminActivityLogs);

// 2FA Management
router.get('/users/:userId/2fa/status', auditLogger('USER_2FA_STATUS_VIEW', 'USER_MANAGEMENT'), getUserTwoFactorStatus);
router.post('/users/:userId/2fa/enable', auditLogger('USER_2FA_ENABLE', 'USER_MANAGEMENT'), enableUserTwoFactor);
router.post('/users/:userId/2fa/disable', auditLogger('USER_2FA_DISABLE', 'USER_MANAGEMENT'), disableUserTwoFactor);

// Clinic Reports
router.get('/clinic-reports', auditLogger('CLINIC_REPORTS_VIEW', 'SUPERADMIN'), getAllClinicReports);

export default router;

