import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Clinic", "SuperAdmin", "Doctor"], default: "Clinic" },
    organizationName: { type: String },
    phone: { type: String },
    organization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization' 
    },
    // Physician ID for Doctor role users (links to Doctor.doctorId)
    physicianId: { 
        type: String,
        required: function() { return this.role === 'Doctor'; }
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    lastLogin: { type: Date },
    
    // 2FA fields
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorBackupCodes: [{ type: String }],
    
    // Login tracking
    loginHistory: [{
        loginTime: { type: Date, default: Date.now },
        loginMethod: { type: String, enum: ['password', '2fa', 'captcha', 'unlock'], default: 'password' },
        ipAddress: { type: String },
        userAgent: { type: String },
        success: { type: Boolean, default: true }
    }],
    
    // Captcha tracking
    captchaAttempts: { type: Number, default: 0 },
    lastCaptchaAttempt: { type: Date }
}, { timestamps: true });

export default mongoose.model("User", userSchema);