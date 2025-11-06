import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import RequestAssessment from "../models/RequestAssessment.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { verifyTwoFactorToken, generateBackupCodes, verifyBackupCode } from "../utils/twoFactorAuth.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalPatients = await Patient.countDocuments();
        const totalDoctors = await Doctor.countDocuments();
        const totalBookings = await RequestAssessment.countDocuments();
        const totalAssessments = await RequestAssessment.countDocuments();
        const pendingAssessments = await RequestAssessment.countDocuments({ status: 'pending' });
        const completedAssessments = await RequestAssessment.countDocuments({ status: 'completed' });
        const totalAdmins = await User.countDocuments({ role: 'Clinic' });
        const activeAdmins = await User.countDocuments({ 
            role: 'Clinic', 
            lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });

        // Get recent admin activities from audit logs
        const recentActivities = await AuditLog.find({ 
            userId: { $exists: true },
            'meta.role': 'Clinic'  // Filter by Admin role in meta field
        })
        .sort({ createdAt: -1 })  // Sort by createdAt not timestamp
        .limit(10)
        .select('action meta createdAt recordType');

        res.status(200).json({
            success: true,
            stats: {
                totalPatients,
                totalDoctors,
                totalBookings,
                totalAssessments,
                pendingAssessments,
                completedAssessments,
                totalAdmins,
                activeAdmins
            },
            recentActivities: recentActivities.map(log => ({
                description: `${log.meta?.userName || 'Clinic'} performed ${log.action}`,
                timestamp: new Date(log.createdAt).toLocaleString(),
                details: log.recordType || 'System'
            }))
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// Get all admin users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['Clinic', 'SuperAdmin'] } })
            .select('-password')
            .populate('organization', 'organizationName emailAddress phoneNumber address contractStartDate contractEndDate contractStatus contactPersonName contactPersonEmail contactPersonPhone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// Create new admin user
export const createUser = async (req, res) => {
    try {
        const { name, email, role, organizationName, phone, isActive } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate random password
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + "!@";
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'Clinic',
            organizationName,
            phone,
            isActive: isActive !== false, // Default to true if not specified
            isVerified: false
        });

        await newUser.save();

        // Generate verification token
        const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-here-make-it-very-long-and-random-for-hipaa-compliance";
        const verificationToken = jwt.sign(
            { id: newUser._id, email: newUser.email },
            jwtSecret,
            { expiresIn: "24h" }
        );

        // Send welcome email with verification link
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${verificationToken}`;
        
        await sendEmail({
            to: email,
            subject: 'Welcome to Caring.ai - Verify Your Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Welcome to Caring.ai</h2>
                    <p>Hello ${name},</p>
                    <p>A SuperAdmin has created an account for you. Please verify your email address to activate your account.</p>
                    <p><strong>Temporary Password:</strong> ${randomPassword}</p>
                    <p style="color: #dc2626; font-size: 14px;">⚠️ Please change your password after first login.</p>
                    <div style="margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        This verification link will expire in 24 hours.
                    </p>
                    <p style="color: #6b7280; font-size: 14px;">
                        If you didn't expect this email, please ignore it.
                    </p>
                </div>
            `
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully. Verification email sent.',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                organizationName: newUser.organizationName,
                phone: newUser.phone,
                isActive: newUser.isActive,
                isVerified: newUser.isVerified,
                lastLogin: newUser.lastLogin
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};

// Update admin user
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role, organizationName, phone, isActive } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow updating SuperAdmin from regular admin management
        if (user.role === 'SuperAdmin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify SuperAdmin users'
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        // Update fields
        if (name) user.name = name;
        if (role) user.role = role;
        if (organizationName !== undefined) user.organizationName = organizationName;
        if (phone !== undefined) user.phone = phone;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                phone: user.phone,
                isActive: user.isActive,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow deactivating SuperAdmin
        if (user.role === 'SuperAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot deactivate SuperAdmin users'
            });
        }

        // Don't allow deactivating yourself
        if (userId === req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }

        // Toggle active status
        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                phone: user.phone,
                isActive: user.isActive,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user status',
            error: error.message
        });
    }
};

// Get admin activity logs
export const getAdminActivityLogs = async (req, res) => {
    try {
        const { adminId, startDate, endDate, limit = 100 } = req.query;

        let query = { 'user.role': 'Clinic' };

        // Filter by specific admin
        if (adminId) {
            query['user._id'] = adminId;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .select('action details timestamp user ipAddress');

        res.status(200).json({
            success: true,
            logs
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity logs',
            error: error.message
        });
    }
};

// Get user's 2FA status
export const getUserTwoFactorStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('username email twoFactorEnabled twoFactorSecret twoFactorBackupCodes');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add audit context
        req.auditContext = {
            targetUserId: userId,
            targetUserEmail: user.email,
            targetUserName: user.username,
            twoFactorStatus: user.twoFactorEnabled ? 'Enabled' : 'Disabled'
        };

        res.status(200).json({
            success: true,
            twoFactorEnabled: user.twoFactorEnabled || false,
            hasSecret: !!user.twoFactorSecret,
            backupCodesCount: user.twoFactorBackupCodes ? user.twoFactorBackupCodes.length : 0
        });
    } catch (error) {
        console.error('Error fetching user 2FA status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user 2FA status',
            error: error.message
        });
    }
};

// Enable 2FA for a user (SuperAdmin can only re-enable if user has secret)
export const enableUserTwoFactor = async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        const user = await User.findById(userId).select('username email twoFactorEnabled twoFactorSecret twoFactorBackupCodes');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has ever set up 2FA (has a secret)
        if (!user.twoFactorSecret) {
            // Add audit context for failed attempt
            req.auditContext = {
                targetUserId: userId,
                targetUserEmail: user.email,
                targetUserName: user.username,
                action: 'ENABLE_2FA_FAILED',
                reason: 'User has no 2FA secret',
                previousStatus: 'No Setup'
            };
            
            return res.status(400).json({
                success: false,
                message: 'User must set up 2FA themselves first. SuperAdmin can only re-enable existing 2FA.'
            });
        }

        // If user already has 2FA enabled, don't override
        if (user.twoFactorEnabled) {
            // Add audit context for failed attempt
            req.auditContext = {
                targetUserId: userId,
                targetUserEmail: user.email,
                targetUserName: user.username,
                action: 'ENABLE_2FA_FAILED',
                reason: 'Already enabled',
                currentStatus: 'Enabled'
            };
            
            return res.status(400).json({
                success: false,
                message: 'User already has 2FA enabled'
            });
        }

        // Verify SuperAdmin password for security
        if (password) {
            const isPasswordValid = await bcrypt.compare(password, req.user.password);
            if (!isPasswordValid) {
                // Add audit context for failed authentication
                req.auditContext = {
                    targetUserId: userId,
                    targetUserEmail: user.email,
                    targetUserName: user.username,
                    action: 'ENABLE_2FA_FAILED',
                    reason: 'Invalid SuperAdmin password',
                    securityEvent: true
                };
                
                return res.status(400).json({
                    success: false,
                    message: 'Invalid password'
                });
            }
        }

        // Re-enable existing 2FA (user already has secret and backup codes)
        const previousStatus = user.twoFactorEnabled;
        user.twoFactorEnabled = true;

        await user.save();

        // Add audit context for successful enable
        req.auditContext = {
            targetUserId: userId,
            targetUserEmail: user.email,
            targetUserName: user.username,
            action: 'ENABLE_2FA_SUCCESS',
            previousStatus: previousStatus ? 'Enabled' : 'Disabled',
            newStatus: 'Enabled',
            backupCodesCount: user.twoFactorBackupCodes?.length || 0,
            performedBy: req.user.email
        };

        res.status(200).json({
            success: true,
            message: '2FA re-enabled successfully',
            twoFactorEnabled: true
        });
    } catch (error) {
        console.error('Error enabling user 2FA:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enable user 2FA',
            error: error.message
        });
    }
};

// Disable 2FA for a user (SuperAdmin can force disable)
export const disableUserTwoFactor = async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        const user = await User.findById(userId).select('username email twoFactorEnabled twoFactorSecret twoFactorBackupCodes');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if 2FA is already disabled
        if (!user.twoFactorEnabled) {
            // Add audit context for failed attempt
            req.auditContext = {
                targetUserId: userId,
                targetUserEmail: user.email,
                targetUserName: user.username,
                action: 'DISABLE_2FA_FAILED',
                reason: 'Already disabled',
                currentStatus: 'Disabled'
            };
            
            return res.status(400).json({
                success: false,
                message: '2FA is already disabled for this user'
            });
        }

        // Verify SuperAdmin password for security
        if (password) {
            const isPasswordValid = await bcrypt.compare(password, req.user.password);
            if (!isPasswordValid) {
                // Add audit context for failed authentication
                req.auditContext = {
                    targetUserId: userId,
                    targetUserEmail: user.email,
                    targetUserName: user.username,
                    action: 'DISABLE_2FA_FAILED',
                    reason: 'Invalid SuperAdmin password',
                    securityEvent: true
                };
                
                return res.status(400).json({
                    success: false,
                    message: 'Invalid password'
                });
            }
        }

        // Disable 2FA (keep secret and backup codes for re-enabling)
        const previousStatus = user.twoFactorEnabled;
        user.twoFactorEnabled = false;
        // Don't clear twoFactorSecret and twoFactorBackupCodes
        // This allows SuperAdmin to re-enable 2FA later

        await user.save();

        // Add audit context for successful disable
        req.auditContext = {
            targetUserId: userId,
            targetUserEmail: user.email,
            targetUserName: user.username,
            action: 'DISABLE_2FA_SUCCESS',
            previousStatus: previousStatus ? 'Enabled' : 'Disabled',
            newStatus: 'Disabled',
            backupCodesPreserved: true,
            secretPreserved: true,
            performedBy: req.user.email
        };

        res.status(200).json({
            success: true,
            message: '2FA disabled successfully. User can still re-enable without setup.',
            twoFactorEnabled: false
        });
    } catch (error) {
        console.error('Error disabling user 2FA:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable user 2FA',
            error: error.message
        });
    }
};

// Get all clinic reports and analytics
export const getAllClinicReports = async (req, res) => {
    try {
        const { startDate, endDate, clinicId } = req.query;

        // Build date filter
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Get all clinics (organizations)
        const clinics = await User.find({ role: 'Clinic' })
            .populate('organization', 'organizationName emailAddress phoneNumber address contractStartDate contractEndDate contractStatus contactPersonName contactPersonEmail contactPersonPhone')
            .select('name email organizationName phone isActive isVerified lastLogin createdAt')
            .sort({ createdAt: -1 });

        // Get clinic-specific data
        const clinicReports = await Promise.all(clinics.map(async (clinic) => {
            // Get patients for this clinic
            const patients = await Patient.find({ createdBy: clinic._id }).countDocuments();
            
            // Get doctors for this clinic
            const doctors = await Doctor.find({ createdBy: clinic._id }).countDocuments();
            
            // Get assessments for this clinic
            const assessments = await RequestAssessment.find({ 
                createdBy: clinic._id,
                ...dateFilter 
            });
            
            const totalAssessments = assessments.length;
            const completedAssessments = assessments.filter(a => a.status === 'completed').length;
            const pendingAssessments = assessments.filter(a => a.status === 'pending').length;
            const approvedAssessments = assessments.filter(a => a.status === 'approved').length;
            const cancelledAssessments = assessments.filter(a => a.status === 'cancelled').length;

            // Get recent activities for this clinic
            const recentActivities = await AuditLog.find({
                userId: clinic._id,
                ...dateFilter
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('action meta createdAt recordType');

            // Calculate completion rate
            const completionRate = totalAssessments > 0 ? 
                Math.round((completedAssessments / totalAssessments) * 100) : 0;

            // Get assessment types breakdown
            const assessmentTypes = {};
            assessments.forEach(assessment => {
                const type = assessment.assessmentType;
                assessmentTypes[type] = (assessmentTypes[type] || 0) + 1;
            });

            // Get monthly trends (last 6 months)
            const monthlyTrends = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                
                const monthlyAssessments = await RequestAssessment.find({
                    createdBy: clinic._id,
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                }).countDocuments();
                
                monthlyTrends.push({
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    count: monthlyAssessments
                });
            }

            return {
                clinic: {
                    _id: clinic._id,
                    name: clinic.name,
                    email: clinic.email,
                    organizationName: clinic.organizationName,
                    phone: clinic.phone,
                    isActive: clinic.isActive,
                    isVerified: clinic.isVerified,
                    lastLogin: clinic.lastLogin,
                    createdAt: clinic.createdAt,
                    organization: clinic.organization
                },
                stats: {
                    totalPatients: patients,
                    totalDoctors: doctors,
                    totalAssessments,
                    completedAssessments,
                    pendingAssessments,
                    approvedAssessments,
                    cancelledAssessments,
                    completionRate
                },
                assessmentTypes,
                monthlyTrends,
                recentActivities: recentActivities.map(log => ({
                    description: `${log.meta?.userName || clinic.name} performed ${log.action}`,
                    timestamp: new Date(log.createdAt).toLocaleString(),
                    details: log.recordType || 'System'
                }))
            };
        }));

        // Calculate system-wide totals
        const systemTotals = {
            totalClinics: clinics.length,
            activeClinics: clinics.filter(c => c.isActive).length,
            totalPatients: await Patient.countDocuments(),
            totalDoctors: await Doctor.countDocuments(),
            totalAssessments: await RequestAssessment.countDocuments(dateFilter),
            completedAssessments: await RequestAssessment.countDocuments({ 
                status: 'completed',
                ...dateFilter 
            }),
            pendingAssessments: await RequestAssessment.countDocuments({ 
                status: 'pending',
                ...dateFilter 
            })
        };

        res.status(200).json({
            success: true,
            data: {
                clinicReports,
                systemTotals,
                dateRange: {
                    startDate: startDate || null,
                    endDate: endDate || null
                }
            }
        });
    } catch (error) {
        console.error('Error fetching clinic reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clinic reports',
            error: error.message
        });
    }
};


