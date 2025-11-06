import express from "express";
import { auditLogger } from "../middleware/auditLogger.js";
import { 
    createEthnicity,
    getAllEthnicities,
    getEthnicityById,
    updateEthnicity,
    deleteEthnicity,
    toggleEthnicityStatus
} from "../controllers/ethnicityController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Create new ethnicity
router.post(
    "/", 
    authenticate, 
    authorize("ethnicities:create"), 
    auditLogger("ETHNICITY_CREATE", "Ethnicity"),
    createEthnicity
);

// Get all ethnicities with pagination and search
router.get(
    "/", 
    authenticate, 
    authorize("ethnicities:read"), 
    auditLogger("ETHNICITY_LIST", "Ethnicity"),
    getAllEthnicities
);

// Get single ethnicity by ID
router.get(
    "/:id", 
    authenticate, 
    authorize("ethnicities:read"), 
    auditLogger("ETHNICITY_VIEW", "Ethnicity"),
    getEthnicityById
);

// Update ethnicity
router.put(
    "/:id", 
    authenticate, 
    authorize("ethnicities:update"), 
    auditLogger("ETHNICITY_UPDATE", "Ethnicity"),
    updateEthnicity
);

// Delete ethnicity
router.delete(
    "/:id", 
    authenticate, 
    authorize("ethnicities:delete"), 
    auditLogger("ETHNICITY_DELETE", "Ethnicity"),
    deleteEthnicity
);

// Toggle ethnicity status
router.patch(
    "/:id/toggle-status", 
    authenticate, 
    authorize("ethnicities:update"), 
    auditLogger("ETHNICITY_STATUS_TOGGLE", "Ethnicity"),
    toggleEthnicityStatus
);

export default router;
