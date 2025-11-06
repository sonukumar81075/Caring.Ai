// routes/auditLogRoutes.js
import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getAuditLogs, getAuditLogById, getAuditLogStats } from "../controllers/auditLogController.js";

const router = express.Router();

// Get all audit logs with pagination and filtering
router.get(
    "/",
    authenticate,
    authorize("audit:read"),
    getAuditLogs
);

// Get audit log by ID
router.get(
    "/:id",
    authenticate,
    authorize("audit:read"),
    getAuditLogById
);

// Get audit log statistics
router.get(
    "/stats/summary",
    authenticate,
    authorize("audit:read"),
    getAuditLogStats
);

export default router;