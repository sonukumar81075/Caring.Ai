import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics (doctors, patients, assessments, etc.)
 * @access  Private (Clinic, SuperAdmin, Doctor)
 */
router.get('/stats', authorize(['Clinic', 'SuperAdmin', 'Doctor']), auditLogger('DASHBOARD_STATS_VIEW', 'DASHBOARD'), getDashboardStats);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity (recent assessments, patients, doctors)
 * @access  Private (Clinic, SuperAdmin, Doctor)
 */
router.get('/activity', authorize(['Clinic', 'SuperAdmin', 'Doctor']), auditLogger('DASHBOARD_ACTIVITY_VIEW', 'DASHBOARD'), getRecentActivity);

export default router;

