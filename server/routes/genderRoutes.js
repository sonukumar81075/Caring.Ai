import express from "express";
import { auditLogger } from "../middleware/auditLogger.js";
import { 
    createGender,
    getAllGenders,
    getGenderById,
    updateGender,
    deleteGender,
    toggleGenderStatus
} from "../controllers/genderController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Create new gender
router.post(
    "/", 
    authenticate, 
    authorize("genders:create"), 
    auditLogger("GENDER_CREATE", "Gender"),
    createGender
);

// Get all genders with pagination and search
router.get(
    "/", 
    authenticate, 
    authorize("genders:read"), 
    auditLogger("GENDER_LIST", "Gender"),
    getAllGenders
);

// Get single gender by ID
router.get(
    "/:id", 
    authenticate, 
    authorize("genders:read"), 
    auditLogger("GENDER_VIEW", "Gender"),
    getGenderById
);

// Update gender
router.put(
    "/:id", 
    authenticate, 
    authorize("genders:update"), 
    auditLogger("GENDER_UPDATE", "Gender"),
    updateGender
);

// Delete gender
router.delete(
    "/:id", 
    authenticate, 
    authorize("genders:delete"), 
    auditLogger("GENDER_DELETE", "Gender"),
    deleteGender
);

// Toggle gender status
router.patch(
    "/:id/toggle-status", 
    authenticate, 
    authorize("genders:update"), 
    auditLogger("GENDER_STATUS_TOGGLE", "Gender"),
    toggleGenderStatus
);

export default router;
