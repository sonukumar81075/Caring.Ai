import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/fieldEncryption.js';

const doctorSchema = new mongoose.Schema({
  // Doctor Information - All PHI fields are encrypted
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
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
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    set: encrypt,
    get: decrypt,
  },
  specialty: {
    type: String,
    required: [true, 'Medical specialty is required'],
    set: encrypt,
    get: decrypt,
    maxlength: [100, 'Specialty cannot exceed 100 characters']
  },
  
  // System fields
  doctorId: {
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

// Pre-save middleware to generate unique doctor ID
doctorSchema.pre('save', function(next) {
  // Always generate doctorId if not present
  if (!this.doctorId || this.doctorId === '') {
    // Generate unique doctor ID with prefix DOC
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.doctorId = `DOC${timestamp}${random}`;
  }
  next();
});

// Index for better query performance
// Note: doctorId already has unique: true in schema, so index is auto-created
doctorSchema.index({ createdAt: -1 });

export default mongoose.model('Doctor', doctorSchema);
