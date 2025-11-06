// auditLog.model.js
import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/fieldEncryption.js";

const auditSchema = new mongoose.Schema({
    user: { 
        type: String, // Changed from ObjectId to String for encrypted user ID
        set: encrypt,
        get: decrypt
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null for actions before login (failed login, etc.)
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null for actions before login
    },
    action: String,
    recordType: String,
    recordId: mongoose.Schema.Types.ObjectId,
    ip: String,
    userAgent: String,
    meta: mongoose.Schema.Types.Mixed,
}, { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Index for better query performance
auditSchema.index({ action: 1 });
auditSchema.index({ recordType: 1 });
auditSchema.index({ createdAt: -1 });
auditSchema.index({ userId: 1 });
auditSchema.index({ createdBy: 1 });

const AuditLog = mongoose.model("AuditLog", auditSchema);

export default AuditLog;