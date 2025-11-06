import express from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  reactivateDoctor,
  exportDoctors,
  getDoctorStats
} from '../controllers/doctorController.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { auditLogger } from '../middleware/auditLogger.js';
import { validateContract } from '../middleware/contractValidator.js';

const router = express.Router();

// Apply authentication and contract validation to all routes
router.use(authenticate);
router.use(validateContract);

// GET /api/doctors - Get all doctors with pagination and filtering
router.get('/',
  checkPermission('doctors', 'read'),
  auditLogger('DOCTOR_LIST_ACCESS', 'DOCTOR'),
  getDoctors
);

// GET /api/doctors/stats - Get doctor statistics
router.get('/stats',
  checkPermission('doctors', 'read'),
  auditLogger('DOCTOR_STATS_ACCESS', 'DOCTOR'),
  getDoctorStats
);

// GET /api/doctors/export - Export doctors data (must be before /:id route)
router.get('/export',
  checkPermission('doctors', 'read'),
  auditLogger('DOCTOR_EXPORT', 'DOCTOR'),
  exportDoctors
);

// GET /api/doctors/:id - Get single doctor by ID
router.get('/:id',
  checkPermission('doctors', 'read'),
  auditLogger('DOCTOR_VIEW', 'DOCTOR'),
  getDoctorById
);

// POST /api/doctors - Create new doctor
router.post('/',
  checkPermission('doctors', 'create'),
  auditLogger('DOCTOR_CREATE', 'DOCTOR'),
  createDoctor
);

// PUT /api/doctors/:id - Update doctor
router.put('/:id',
  checkPermission('doctors', 'update'),
  auditLogger('DOCTOR_UPDATE', 'DOCTOR'),
  updateDoctor
);

// DELETE /api/doctors/:id - Delete doctor (deactivate)
router.delete('/:id',
  checkPermission('doctors', 'delete'),
  auditLogger('DOCTOR_DELETE', 'DOCTOR'),
  deleteDoctor
);

// PUT /api/doctors/:id/reactivate - Reactivate doctor
router.put('/:id/reactivate',
  checkPermission('doctors', 'update'),
  auditLogger('DOCTOR_REACTIVATE', 'DOCTOR'),
  reactivateDoctor
);

export default router;
