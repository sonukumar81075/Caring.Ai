import express from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  reactivatePatient,
  exportPatients,
  getPatientStatistics,
  searchPatients
} from '../controllers/patientController.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { auditLogger } from '../middleware/auditLogger.js';
import { validateContract } from '../middleware/contractValidator.js';

const router = express.Router();

// Apply authentication and contract validation to all routes
router.use(authenticate);
router.use(validateContract);

// Patient CRUD Routes
// GET /api/patients - Get all patients with pagination and filtering
router.get('/', 
  checkPermission('patients', 'read'),
  auditLogger('PATIENT_LIST_ACCESS', 'PATIENT'),
  getPatients
);

// GET /api/patients/statistics - Get patient statistics
router.get('/statistics',
  checkPermission('patients', 'read'),
  auditLogger('PATIENT_STATISTICS_ACCESS', 'PATIENT'),
  getPatientStatistics
);

// GET /api/patients/search - Search patients
router.post('/search',
  checkPermission('patients', 'read'),
  auditLogger('PATIENT_SEARCH', 'PATIENT'),
  searchPatients
);

// GET /api/patients/export - Export patients data (must be before /:id route)
router.get('/export',
  checkPermission('patients', 'read'),
  auditLogger('PATIENT_EXPORT', 'PATIENT'),
  exportPatients
);

// GET /api/patients/:id - Get single patient by ID
router.get('/:id',
  checkPermission('patients', 'read'),
  auditLogger('PATIENT_VIEW', 'PATIENT'),
  getPatientById
);

// POST /api/patients - Create new patient
router.post('/',
  checkPermission('patients', 'create'),
  auditLogger('PATIENT_CREATE', 'PATIENT'),
  createPatient
);

// PUT /api/patients/:id - Update patient information
router.put('/:id',
  checkPermission('patients', 'update'),
  auditLogger('PATIENT_UPDATE', 'PATIENT'),
  updatePatient
);

// DELETE /api/patients/:id - Soft delete patient (mark as inactive)
router.delete('/:id',
  checkPermission('patients', 'delete'),
  auditLogger('PATIENT_DELETE', 'PATIENT'),
  deletePatient
);

// PUT /api/patients/:id/reactivate - Reactivate patient
router.put('/:id/reactivate',
  checkPermission('patients', 'update'),
  auditLogger('PATIENT_REACTIVATE', 'PATIENT'),
  reactivatePatient
);

export default router;
