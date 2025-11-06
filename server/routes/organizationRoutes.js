import express from 'express';
import {
    getOrganization,
    createOrganization,
    updateOrganization,
    updateContractInfo,
    getAllOrganizations,
    requestContractRenewal,
    approveContractRenewal,
    rejectContractRenewal,
    getContractStatus,
    extendContract,
    reduceContract
} from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all organizations (SuperAdmin only) - Must be before /my-organization
router.get('/', authorize(['SuperAdmin']), auditLogger('ORGANIZATION_LIST', 'ORGANIZATION'), getAllOrganizations);

// Get contract status (Admin and SuperAdmin)
router.get('/contract-status', auditLogger('CONTRACT_STATUS_CHECK', 'ORGANIZATION'), getContractStatus);

// Get current user's organization
router.get('/my-organization', auditLogger('ORGANIZATION_VIEW', 'ORGANIZATION'), getOrganization);

// Create organization (Clinic and SuperAdmin)
router.post('/', authorize(['Clinic', 'SuperAdmin']), auditLogger('ORGANIZATION_CREATE', 'ORGANIZATION'), createOrganization);

// Update organization (editable fields)
router.put('/my-organization', auditLogger('ORGANIZATION_UPDATE', 'ORGANIZATION'), updateOrganization);

// Request contract renewal (Clinic only)
router.post('/request-renewal', authorize(['Clinic']), auditLogger('CONTRACT_RENEWAL_REQUEST', 'ORGANIZATION'), requestContractRenewal);

// Approve contract renewal (SuperAdmin only)
router.post('/:organizationId/renewal/:requestId/approve', authorize(['SuperAdmin']), auditLogger('CONTRACT_RENEWAL_APPROVE', 'ORGANIZATION'), approveContractRenewal);

// Reject contract renewal (SuperAdmin only)
router.post('/:organizationId/renewal/:requestId/reject', authorize(['SuperAdmin']), auditLogger('CONTRACT_RENEWAL_REJECT', 'ORGANIZATION'), rejectContractRenewal);

// Update contract information (SuperAdmin only)
router.put('/:organizationId/contract', authorize(['SuperAdmin']), auditLogger('ORGANIZATION_CONTRACT_UPDATE', 'ORGANIZATION'), updateContractInfo);

// Extend contract (SuperAdmin only) - Add time to existing contract
router.post('/:organizationId/extend', authorize(['SuperAdmin']), auditLogger('CONTRACT_EXTEND', 'ORGANIZATION'), extendContract);

// Reduce contract (SuperAdmin only) - Remove time from existing contract
router.post('/:organizationId/reduce', authorize(['SuperAdmin']), auditLogger('CONTRACT_REDUCE', 'ORGANIZATION'), reduceContract);

export default router;

