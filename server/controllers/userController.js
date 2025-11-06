import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { sendEmail } from "../utils/sendEmail.js";
import { 
    createVerificationEmailTemplate, 
    createWelcomeEmailTemplate,
    createForgotPasswordEmailTemplate 
} from "../utils/emailTemplates.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { 
    generateTwoFactorSecret, 
    generateQRCode, 
    verifyTwoFactorToken, 
    generateBackupCodes,
    verifyBackupCode,
    getClientIP,
    getUserAgent
} from "../utils/twoFactorAuth.js";
import { generateHiddenCaptcha, verifyHiddenCaptcha } from "../utils/captcha.js";

// Helper function to create default organization for verified users
const createDefaultOrganization = async (user) => {
    try {
        // Check if user already has an organization
        if (user.organization) {
            return user.organization;
        }

        // Resolve SuperAdmin owner: if current user is SuperAdmin use them, otherwise pick an existing SuperAdmin from DB
        let superAdminId = null;
        if (user.role === 'SuperAdmin') {
            superAdminId = user._id;
        } else {
            const superAdminUser = await User.findOne({ role: 'SuperAdmin', isActive: true }).sort({ createdAt: 1 });
            if (superAdminUser) {
                superAdminId = superAdminUser._id;
            } else {
                console.error('No SuperAdmin user found to assign as organization owner.');
                return null; // Abort org creation to avoid invalid data
            }
        }

        // Create default organization data
        const defaultOrgData = {
            organizationName: user.organizationName || `${user.username || user.name || user.email}'s Organization`,
            emailAddress: user.email,
            phoneNumber: user.phone || '',
            address: 'To be updated', // Default placeholder
            contractStartDate: new Date(),
            contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            contractDurationMonths: 12,
            gracePeriodDays: 7,
            contactPersonName: user.name || user.username || user.email,
            contactPersonEmail: user.email,
            contactPersonPhone: user.phone || '',
            superAdmin: superAdminId,
            createdBy: superAdminId
        };

        // Create the organization
        const organization = new Organization(defaultOrgData);
        await organization.save();

        // Update user with organization reference
        user.organization = organization._id;
        if (!user.organizationName) {
            user.organizationName = defaultOrgData.organizationName;
        }
        await user.save();

        return organization._id;
    } catch (error) {
        console.error('Error creating default organization:', error);
        // Don't throw error to avoid breaking verification process
        return null;
    }
};

export const signUp = async(req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || "Clinic",
            verificationToken
        });

        await newUser.save();

        const verifyUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
        await sendEmail(
            email,
            "Welcome to Caring AI - Verify Your Account",
            createVerificationEmailTemplate(username, verifyUrl)
        );

        res.status(201).json({ 
            message: "User registered successfully. Please check your email for verification.",
            success: true 
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
}

export const verify = async(req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Create default organization for verified users (only for Clinic and SuperAdmin roles)
        if (user.role === 'Clinic' || user.role === 'SuperAdmin') {
            try {
                await createDefaultOrganization(user);
                console.log(`Default organization created for user: ${user.email}`);
            } catch (orgError) {
                console.error("Error creating default organization:", orgError);
                // Don't fail verification if organization creation fails
            }
        }

        // Send welcome email after successful verification 
        const loginUrl = `${process.env.CLIENT_URL}/login`;
        try {
            await sendEmail(
                user.email,
                "Welcome to Caring AI - Your Account is Ready!",
                createWelcomeEmailTemplate(user.username || user.name, loginUrl)
            );
        } catch (emailError) {
            console.error("Error sending welcome email:", emailError);
            // Don't fail verification if email fails
        }

        res.json({ 
            message: "Email verified successfully. You can now log in.",
            success: true 
        });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ message: "Error verifying email" });
    }
}

export const login = async(req, res) => {
    try {
        const { email, password, twoFactorCode, backupCode, captchaSessionId, captchaAnswer, isUnlock } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email before logging in" });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                message: "Your account has been deactivated. Please contact your administrator for assistance." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Skip 2FA and Captcha verification for lock screen unlock
        if (isUnlock) {
            // Log unlock event
            user.loginHistory.push({
                loginTime: new Date(),
                loginMethod: 'unlock',
                ipAddress: getClientIP(req),
                userAgent: getUserAgent(req),
                success: true
            });

            // Keep only last 50 login records
            if (user.loginHistory.length > 50) {
                user.loginHistory = user.loginHistory.slice(-50);
            }

            await user.save();

            // Generate JWT token
            const jwtSecret = process.env.JWT_SECRET || "9a2d5b7e8f1c4a6d9e3f0b2c1d8a7e4f6c3b9a5d2f7e8c1b0a3d6f5e2b4c8a9f";
            const token = jwt.sign(
                { 
                    id: user._id, 
                    role: user.role,
                    email: user.email,
                    username: user.username
                },
                jwtSecret, 
                { expiresIn: "24h" }
            );

            // Set secure HTTP-only cookie
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                path: '/'
            };

            res.cookie('authToken', token, cookieOptions);

            return res.json({ 
                message: "Screen unlocked successfully",
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organizationName: user.organizationName,
                    phone: user.phone,
                    physicianId: user.physicianId, // Include Physician ID for Doctor role users
                    isActive: user.isActive,
                    isVerified: user.isVerified,
                    lastLogin: user.lastLogin,
                    twoFactorEnabled: user.twoFactorEnabled
                }
            });
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            if (!twoFactorCode && !backupCode) {
                return res.status(200).json({
                    message: "2FA verification required",
                    success: false,
                    requiresTwoFactor: true,
                    twoFactorEnabled: true
                });
            }

            let twoFactorValid = false;

            // Verify 2FA code
            if (twoFactorCode) {
                twoFactorValid = verifyTwoFactorToken(user.twoFactorSecret, twoFactorCode);
            }

            // Verify backup code if 2FA code failed
            if (!twoFactorValid && backupCode) {
                twoFactorValid = verifyBackupCode(user.twoFactorBackupCodes, backupCode);
                if (twoFactorValid) {
                    // Update user with used backup code
                    await user.save();
                }
            }

            if (!twoFactorValid) {
                // Log failed 2FA attempt
                user.loginHistory.push({
                    loginTime: new Date(),
                    loginMethod: '2fa',
                    ipAddress: getClientIP(req),
                    userAgent: getUserAgent(req),
                    success: false
                });
                await user.save();

                return res.status(401).json({ 
                    message: "Invalid 2FA code or backup code",
                    success: false,
                    requiresTwoFactor: true
                });
            }
        }

        // Handle hidden captcha for users without 2FA
        if (!user.twoFactorEnabled) {
            if (!captchaSessionId || !captchaAnswer) {
                // Generate hidden captcha
                const captcha = generateHiddenCaptcha();
                return res.status(200).json({
                    message: "Captcha verification required",
                    success: false,
                    requiresCaptcha: true,
                    captchaSessionId: captcha.sessionId,
                    challenge: captcha.challenge
                });
            }

            // Verify captcha
            const captchaResult = verifyHiddenCaptcha(captchaSessionId, captchaAnswer);
            if (!captchaResult.success) {
                // Log failed captcha attempt
                user.captchaAttempts += 1;
                user.lastCaptchaAttempt = new Date();
                user.loginHistory.push({
                    loginTime: new Date(),
                    loginMethod: 'captcha',
                    ipAddress: getClientIP(req),
                    userAgent: getUserAgent(req),
                    success: false
                });
                await user.save();

                return res.status(401).json({ 
                    message: captchaResult.error || "Invalid captcha",
                    success: false,
                    requiresCaptcha: true,
                    attemptsLeft: captchaResult.attemptsLeft
                });
            }
        }

        // Update last login timestamp and login history
        user.lastLogin = new Date();
        user.loginHistory.push({
            loginTime: new Date(),
            loginMethod: user.twoFactorEnabled ? '2fa' : 'captcha',
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
            success: true
        });

        // Keep only last 50 login records
        if (user.loginHistory.length > 50) {
            user.loginHistory = user.loginHistory.slice(-50);
        }

        await user.save();

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || "9a2d5b7e8f1c4a6d9e3f0b2c1d8a7e4f6c3b9a5d2f7e8c1b0a3d6f5e2b4c8a9f";
        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role,
                email: user.email,
                username: user.username
            },
            jwtSecret, 
            { expiresIn: "24h" }
        );

        // Set secure HTTP-only cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        };

        res.cookie('authToken', token, cookieOptions);

        // Log successful login
        console.log(`User ${user.email} logged in successfully at ${user.lastLogin}`);

        res.json({ 
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                phone: user.phone,
                physicianId: user.physicianId, // Include Physician ID for Doctor role users
                isActive: user.isActive,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Error logging in" });
    }
}

export const logout = async(req, res) => {
    try {
        // Clear the auth cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/'
        });

        res.json({ 
            message: "Logout successful",
            success: true 
        });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Error logging out" });
    }
}

export const getCurrentUser = async(req, res) => {
    try {
        // User is already attached by auth middleware
        const user = req.user;
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                phone: user.phone,
                physicianId: user.physicianId, // Include Physician ID for Doctor role users
                isActive: user.isActive,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            }
        });
    } catch (err) {
        console.error("Get current user error:", err);
        res.status(500).json({ message: "Error fetching user data" });
    }
}

// Test endpoint to generate a fresh verification token (for development only)
export const generateTestToken = async(req, res) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({ message: "This endpoint is only available in development" });
        }

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.verificationToken = verificationToken;
        user.isVerified = false;
        await user.save();

        res.json({
            success: true,
            message: "New verification token generated",
            token: verificationToken,
            verifyUrl: `${process.env.CLIENT_URL || 'http://localhost:8000'}/verify/${verificationToken}`
        });
    } catch (err) {
        console.error("Generate test token error:", err);
        res.status(500).json({ message: "Error generating test token" });
    }
}

// Forgot Password - Request reset link
export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                message: "Email is required",
                success: false 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists for security
            return res.json({ 
                message: "Email not exists, Please try another",
                success: false 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        try {
            await sendEmail(
                email,
                "Password Reset Request - Caring AI",
                createForgotPasswordEmailTemplate(user.username || user.name, resetUrl)
            );
            
            res.json({ 
                message: "Password reset link has been sent to your email.",
                success: true 
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            // Clean up the reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            
            return res.status(500).json({ 
                message: "Failed to send password reset email. Please try again later.",
                success: false 
            });
        }
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ 
            message: "Error processing password reset request. Please try again.",
            success: false 
        });
    }
};

// Reset Password - Verify token and set new password
export const resetPassword = async(req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Reset token is required" });
        }

        if (!password) {
            return res.status(400).json({ message: "New password is required" });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ 
            message: "Password has been reset successfully. You can now log in with your new password.",
            success: true 
        });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Error resetting password" });
    }
};

// ===== 2FA MANAGEMENT FUNCTIONS =====

/**
 * Setup 2FA for a user
 */
export const setupTwoFactor = async(req, res) => {
    try {
        const user = req.user; // User from auth middleware

        if (user.twoFactorEnabled) {
            return res.status(400).json({ 
                message: "2FA is already enabled for this account",
                success: false 
            });
        }

        // Generate new 2FA secret
        const twoFactorData = generateTwoFactorSecret(user.email);
        
        // Generate QR code
        const qrCodeUrl = await generateQRCode(twoFactorData.qrCodeUrl);

        // Generate backup codes
        const backupCodes = generateBackupCodes();

        // Store secret and backup codes (but don't enable 2FA yet)
        user.twoFactorSecret = twoFactorData.secret;
        user.twoFactorBackupCodes = backupCodes;
        await user.save();

        res.json({
            message: "2FA setup initiated",
            success: true,
            qrCodeUrl,
            backupCodes,
            secret: twoFactorData.secret // For testing purposes
        });
    } catch (err) {
        console.error("Setup 2FA error:", err);
        res.status(500).json({ 
            message: "Error setting up 2FA",
            success: false 
        });
    }
};

/**
 * Verify and enable 2FA
 */
export const verifyAndEnableTwoFactor = async(req, res) => {
    try {
        const { twoFactorCode } = req.body;
        const user = req.user;

        if (!twoFactorCode) {
            return res.status(400).json({ 
                message: "2FA code is required",
                success: false 
            });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({ 
                message: "2FA setup not initiated",
                success: false 
            });
        }

        // Verify the 2FA code
        const isValid = verifyTwoFactorToken(user.twoFactorSecret, twoFactorCode);
        
        if (!isValid) {
            return res.status(401).json({ 
                message: "Invalid 2FA code",
                success: false 
            });
        }

        // Enable 2FA
        user.twoFactorEnabled = true;
        await user.save();

        res.json({
            message: "2FA enabled successfully",
            success: true,
            twoFactorEnabled: true
        });
    } catch (err) {
        console.error("Verify 2FA error:", err);
        res.status(500).json({ 
            message: "Error verifying 2FA",
            success: false 
        });
    }
};

/**
 * Disable 2FA
 */
export const disableTwoFactor = async(req, res) => {
    try {
        const { password, twoFactorCode } = req.body;
        const user = req.user;

        if (!password) {
            return res.status(400).json({ 
                message: "Password is required to disable 2FA",
                success: false 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: "Invalid password",
                success: false 
            });
        }

        // Verify 2FA code if provided
        if (twoFactorCode && user.twoFactorSecret) {
            const isValid = verifyTwoFactorToken(user.twoFactorSecret, twoFactorCode);
            if (!isValid) {
                return res.status(401).json({ 
                    message: "Invalid 2FA code",
                    success: false 
                });
            }
        }

        // Disable 2FA and clear data
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorBackupCodes = [];
        await user.save();

        res.json({
            message: "2FA disabled successfully",
            success: true,
            twoFactorEnabled: false
        });
    } catch (err) {
        console.error("Disable 2FA error:", err);
        res.status(500).json({ 
            message: "Error disabling 2FA",
            success: false 
        });
    }
};

/**
 * Get 2FA status
 */
export const getTwoFactorStatus = async(req, res) => {
    try {
        const user = req.user;

        res.json({
            success: true,
            twoFactorEnabled: user.twoFactorEnabled,
            hasBackupCodes: user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0
        });
    } catch (err) {
        console.error("Get 2FA status error:", err);
        res.status(500).json({ 
            message: "Error getting 2FA status",
            success: false 
        });
    }
};

/**
 * Get login history
 */
export const getLoginHistory = async(req, res) => {
    try {
        const user = req.user;

        // Return last 20 login attempts
        const recentLogins = user.loginHistory.slice(-20).reverse();

        res.json({
            success: true,
            loginHistory: recentLogins,
            totalLogins: user.loginHistory.length
        });
    } catch (err) {
        console.error("Get login history error:", err);
        res.status(500).json({ 
            message: "Error getting login history",
            success: false 
        });
    }
};

/**
 * Change password for authenticated user
 */
export const changePassword = async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: "Current password and new password are required",
                success: false 
            });
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                message: "New password must be at least 8 characters long",
                success: false 
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                message: "Current password is incorrect",
                success: false 
            });
        }

        // Check if new password is different from current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ 
                message: "New password must be different from current password",
                success: false 
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        // Log the password change
        const clientIP = getClientIP(req);
        const userAgent = getUserAgent(req);
        
        user.loginHistory.push({
            action: 'PASSWORD_CHANGED',
            timestamp: new Date(),
            ipAddress: clientIP,
            userAgent: userAgent,
            success: true
        });

        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ 
            message: "Error changing password",
            success: false 
        });
    }
};