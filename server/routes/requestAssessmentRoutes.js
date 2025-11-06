import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';
import { validateContract } from '../middleware/contractValidator.js';
import {
  createRequestAssessment,
  getRequestAssessments,
  getRequestAssessmentById,
  updateRequestAssessmentStatus,
  deleteRequestAssessment,
  getRequestAssessmentStats,
  getAssessmentResults,
  getAssessmentQuestions
} from '../controllers/requestAssessmentController.js';

const router = express.Router();

// Apply authentication and contract validation to all routes
router.use(authenticate);
router.use(validateContract);

// Get assessment request statistics (must be before /:id route)
router.get(
  '/stats/summary',
  authorize('assessmentRequest:read'),
  auditLogger('ASSESSMENT_REQUEST_STATS', 'RequestAssessment'),
  getRequestAssessmentStats
);

// Create a new assessment request
router.post(
  '/',
  authorize('assessmentRequest:create'),
  auditLogger('ASSESSMENT_REQUEST_CREATE', 'RequestAssessment'),
  createRequestAssessment
);

// Get all assessment requests with pagination and filtering
router.get(
  '/',
  authorize('assessmentRequest:read'),
  auditLogger('ASSESSMENT_REQUEST_LIST', 'RequestAssessment'),
  getRequestAssessments
);

// Get assessment results for Assessment Results & Management page
router.get(
  '/results',
  authorize('assessmentRequest:read'),
  auditLogger('ASSESSMENT_RESULTS_LIST', 'RequestAssessment'),
  getAssessmentResults
);

// Get assessment questions by call ID
router.get(
  '/questions/:callId',
  authorize('assessmentRequest:read'),
  auditLogger('ASSESSMENT_QUESTIONS_VIEW', 'RequestAssessment'),
  getAssessmentQuestions
);

// Get assessment request by ID
router.get(
  '/:id',
  authorize('assessmentRequest:read'),
  auditLogger('ASSESSMENT_REQUEST_VIEW', 'RequestAssessment'),
  getRequestAssessmentById
);

// Update assessment request status
router.patch(
  '/:id/status',
  authorize('assessmentRequest:update'),
  auditLogger('ASSESSMENT_REQUEST_STATUS_UPDATE', 'RequestAssessment'),
  updateRequestAssessmentStatus
);

// Delete assessment request
router.delete(
  '/:id',
  authorize('assessmentRequest:delete'),
  auditLogger('ASSESSMENT_REQUEST_DELETE', 'RequestAssessment'),
  deleteRequestAssessment
);

export default router;
