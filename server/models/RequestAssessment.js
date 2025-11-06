import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/fieldEncryption.js';

const requestAssessmentSchema = new mongoose.Schema({
  // Patient Information
  patientName: {
    type: String,
    required: true,
    trim: true,
    set: encrypt,
    get: decrypt
  },
  patientId: {
    type: String,
    required: true,
    trim: true,
    set: encrypt,
    get: decrypt
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    set: encrypt,
    get: decrypt
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    required: false, // Optional field
    trim: true
  },
  ethnicity: {
    type: String,
    required: false, // Optional field
    trim: true
  },
  hasCaregiver: {
    type: String,
    required: true,
    enum: ['Yes', 'No']
  },
  searchPatient: {
    type: String,
    required: true,
    trim: true,
    set: encrypt,
    get: decrypt
  },

  // Assessment Information
  assessmentType: {
    type: String,
    required: true,
    trim: true
  },
  assigningPhysician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },

  // Scheduling Information
  assessmentDate: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    required: true,
    trim: true
  },
  timeHour: {
    type: String,
    required: true,
    trim: true
  },
  timeMinute: {
    type: String,
    required: true,
    trim: true
  },
  timeAmPm: {
    type: String,
    required: true,
    enum: ['AM', 'PM']
  },

  // Communication Notes (Optional)
  communicationNotes: {
    type: String,
    required: false, // Optional field
    trim: true,
    set: encrypt,
    get: decrypt
  },

  // Consent
  consentAccepted: {
    type: Boolean,
    required: true,
    default: false
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Retell batch call information
  retellBatchCallData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    default:{} // { batchCallId: string, batchCallData: object, error: string }
  },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    getters: true,
    transform: function(doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.__v;
      return ret;
    }
  },
  toObject: { getters: true }
});

// Index for better query performance
requestAssessmentSchema.index({ patientId: 1 });
requestAssessmentSchema.index({ assessmentDate: 1 });
requestAssessmentSchema.index({ status: 1 });
requestAssessmentSchema.index({ createdBy: 1 });

export default mongoose.model('RequestAssessment', requestAssessmentSchema);
