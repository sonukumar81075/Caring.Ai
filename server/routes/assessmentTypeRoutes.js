import express from "express";
import { auditLogger } from "../middleware/auditLogger.js";
import { 
    createAssessmentType,
    getAllAssessmentTypes,
    getAssessmentTypeById,
    updateAssessmentType,
    deleteAssessmentType,
    toggleAssessmentTypeStatus
} from "../controllers/assessmentTypeController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Create new assessment type
router.post(
    "/", 
    authenticate, 
    authorize("assessmentTypes:create"), 
    auditLogger("ASSESSMENT_TYPE_CREATE", "AssessmentType"),
    createAssessmentType
);

// Get all assessment types with pagination and search
router.get(
    "/", 
    authenticate, 
    authorize("assessmentTypes:read"), 
    auditLogger("ASSESSMENT_TYPE_LIST", "AssessmentType"),
    getAllAssessmentTypes
);

// Get single assessment type by ID
router.get(
    "/:id", 
    authenticate, 
    authorize("assessmentTypes:read"), 
    auditLogger("ASSESSMENT_TYPE_VIEW", "AssessmentType"),
    getAssessmentTypeById
);

// Update assessment type
router.put(
    "/:id", 
    authenticate, 
    authorize("assessmentTypes:update"), 
    auditLogger("ASSESSMENT_TYPE_UPDATE", "AssessmentType"),
    updateAssessmentType
);

// Delete assessment type
router.delete(
    "/:id", 
    authenticate, 
    authorize("assessmentTypes:delete"), 
    auditLogger("ASSESSMENT_TYPE_DELETE", "AssessmentType"),
    deleteAssessmentType
);

// Toggle assessment type status
router.patch(
    "/:id/toggle-status", 
    authenticate, 
    authorize("assessmentTypes:update"), 
    auditLogger("ASSESSMENT_TYPE_STATUS_TOGGLE", "AssessmentType"),
    toggleAssessmentTypeStatus
);

export default router;
