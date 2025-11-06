import mongoose from "mongoose";

const assessmentTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    agentId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    }
}, { 
    timestamps: true 
});

// Index for better query performance
// Note: name and agentId already have unique: true in schema, so indexes are auto-created
assessmentTypeSchema.index({ status: 1 });

export default mongoose.model("AssessmentType", assessmentTypeSchema);
