import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    // Organization Details
    organizationName: { 
        type: String, 
        required: true 
    },
    emailAddress: { 
        type: String, 
        required: true 
    },
    phoneNumber: { 
        type: String 
    },
    address: { 
        type: String, 
        required: true 
    },
    
    // Contract Information (Managed by SuperAdmin)
    contractStartDate: { 
        type: Date, 
        required: true 
    },
    contractEndDate: { 
        type: Date, 
        required: true 
    },
    contractDurationMonths: {
        type: Number,
        required: true,
        default: 12, // Default 1 year
        min: 1,
        max: 120 // Max 10 years
    },
    contractStatus: {
        type: String,
        enum: ['Active', 'Expired', 'Suspended', 'PendingRenewal'],
        default: 'Active'
    },
    gracePeriodDays: {
        type: Number,
        default: 7, // 7 days grace period after expiry
        min: 0,
        max: 30
    },
    
    // Contract Renewal Management
    renewalRequests: [{
        requestDate: { type: Date, default: Date.now },
        requestedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        requestedByName: String,
        requestedByEmail: String,
        message: String,
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: Date,
        reviewNotes: String,
        requestedDurationMonths: {
            type: Number,
            default: 12
        }
    }],
    
    // Contract History
    contractHistory: [{
        startDate: Date,
        endDate: Date,
        durationMonths: Number,
        renewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        renewedAt: Date,
        notes: String
    }],
    
    // Contact Person Details
    contactPersonName: { 
        type: String, 
        required: true 
    },
    contactPersonEmail: { 
        type: String, 
        required: true 
    },
    contactPersonPhone: { 
        type: String 
    },
    
    // Super Admin Reference (Auto-populated from user who created it)
    superAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Method to check if contract is valid (including grace period)
organizationSchema.methods.isContractValid = function() {
    const now = new Date();
    const endDate = new Date(this.contractEndDate);
    const gracePeriodEnd = new Date(endDate.getTime() + (this.gracePeriodDays * 24 * 60 * 60 * 1000));
    
    return now <= gracePeriodEnd && this.contractStatus !== 'Suspended';
};

// Method to check if in grace period
organizationSchema.methods.isInGracePeriod = function() {
    const now = new Date();
    const endDate = new Date(this.contractEndDate);
    const gracePeriodEnd = new Date(endDate.getTime() + (this.gracePeriodDays * 24 * 60 * 60 * 1000));
    
    return now > endDate && now <= gracePeriodEnd;
};

// Method to get days until expiry
organizationSchema.methods.getDaysUntilExpiry = function() {
    const now = new Date();
    const endDate = new Date(this.contractEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export default mongoose.model("Organization", organizationSchema);

