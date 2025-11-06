import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/fieldEncryption.js';

const patientSchema = new mongoose.Schema({
  // Only the 4 essential fields
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    set: encrypt,
    get: decrypt,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    set: encrypt,
    get: decrypt,
    maxlength: [255, 'Email cannot exceed 255 characters'],
  },
  contactNo: {
    type: String,
    required: [true, 'Contact number is required'],
    set: encrypt,
    get: decrypt,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
    // Not encrypted - dates are less sensitive and avoid decryption issues
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be a positive number'],
    max: [150, 'Age must be realistic']
  },
  
  // System fields (minimal)
  patientId: {
    type: String,
    unique: true,
    required: false // Will be auto-generated in pre-save middleware
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  deactivatedAt: {
    type: Date,
    default: null
  },
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Pre-save middleware to generate unique patient ID
patientSchema.pre('save', function(next) {
  // Always generate patientId if not present
  if (!this.patientId || this.patientId === '') {
    // Generate unique patient ID with prefix PAT
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.patientId = `PAT${timestamp}${random}`;
  }
  next();
});

// Index for better query performance
// Note: patientId already has unique: true in schema, so index is auto-created
patientSchema.index({ createdAt: -1 });

export default mongoose.model('Patient', patientSchema);