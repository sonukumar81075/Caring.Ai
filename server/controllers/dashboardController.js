import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import RequestAssessment from '../models/RequestAssessment.js';
import User from '../models/User.js';

// Get dashboard statistics for Admin users
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Build filter based on user role
        // Admin users see only data they created
        // SuperAdmin sees all data
        let filter = {};
        
        if (userRole === 'Clinic') {
            filter.createdBy = userId;
        } else if (userRole === 'Doctor') {
            // For Doctor role users, find the Doctor document by physicianId and use its _id
            const doctor = await Doctor.findOne({ doctorId: req.user.physicianId });
            if (doctor) {
                filter.assigningPhysician = doctor._id;
            } else {
                // If doctor not found, return empty statistics
                return res.status(200).json({
                    success: true,
                    data: {
                        doctors: { total: 0, active: 0 },
                        patients: { total: 0, active: 0 },
                        assessments: {
                            total: 0,
                            pending: 0,
                            scheduled: 0,
                            completed: 0,
                            cancelled: 0,
                            bookingQueue: 0
                        },
                        timeBased: {
                            today: 0,
                            thisWeek: 0,
                            thisMonth: 0,
                            recent: 0
                        },
                        users: {
                            total: 0,
                            active: 0,
                            verified: 0
                        }
                    }
                });
            }
        }
        // SuperAdmin sees all data (no filter)
        // Count total doctors
        const totalDoctors = await Doctor.countDocuments(filter) || 0;

        // Count active doctors
        const activeDoctors = await Doctor.countDocuments({ ...filter, isActive: true }) || 0;

        // Count total patients
        const totalPatients = await Patient.countDocuments(filter) || 0;

        // Count active patients
        const activePatients = await Patient.countDocuments({ ...filter, isActive: true }) || 0;

        // Count total assessment requests
        const totalAssessments = await RequestAssessment.countDocuments(filter) || 0;

        // Count assessments by status (lowercase to match database)
        const pendingAssessments = await RequestAssessment.countDocuments({ 
            ...filter, 
            status: 'pending' 
        }) || 0;

        const scheduledAssessments = await RequestAssessment.countDocuments({ 
            ...filter, 
            status: 'scheduled' 
        }) || 0;

        const completedAssessments = await RequestAssessment.countDocuments({ 
            ...filter, 
            status: 'completed' 
        }) || 0;

        const cancelledAssessments = await RequestAssessment.countDocuments({ 
            ...filter, 
            status: 'cancelled' 
        }) || 0;

        // Count booking queue (Pending + Scheduled)
        const bookingQueue = pendingAssessments + scheduledAssessments;

        // Get recent assessments (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentAssessments = await RequestAssessment.countDocuments({
            ...filter,
            createdAt: { $gte: sevenDaysAgo }
        }) || 0;

        // Get today's assessments
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayAssessments = await RequestAssessment.countDocuments({
            ...filter,
            assessmentDate: { $gte: todayStart, $lte: todayEnd }
        }) || 0;

        // Get this week's assessments
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekAssessments = await RequestAssessment.countDocuments({
            ...filter,
            assessmentDate: { $gte: weekStart }
        }) || 0;

        // Get this month's assessments
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthAssessments = await RequestAssessment.countDocuments({
            ...filter,
            assessmentDate: { $gte: monthStart }
        }) || 0;

        // Count users
        let totalUsers = 0;
        if (userRole === 'Clinic') {
            // Admin sees only users they created
            totalUsers = await User.countDocuments({ createdBy: userId }) || 0;
        } else if (userRole === 'SuperAdmin') {
            // SuperAdmin sees all users
            totalUsers = await User.countDocuments() || 0;
        }

        // Response with all statistics
        res.status(200).json({
            success: true,
            stats: {
                // Doctor statistics
                doctors: {
                    total: totalDoctors,
                    active: activeDoctors,
                    inactive: totalDoctors - activeDoctors
                },
                // Patient statistics
                patients: {
                    total: totalPatients,
                    active: activePatients,
                    inactive: totalPatients - activePatients
                },
                // Assessment statistics
                assessments: {
                    total: totalAssessments,
                    pending: pendingAssessments,
                    scheduled: scheduledAssessments,
                    completed: completedAssessments,
                    cancelled: cancelledAssessments,
                    bookingQueue: bookingQueue
                },
                // Time-based statistics
                timeBased: {
                    today: todayAssessments,
                    thisWeek: weekAssessments,
                    thisMonth: monthAssessments,
                    recent: recentAssessments
                },
                // User statistics
                users: {
                    total: totalUsers
                }
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// Get recent activity for dashboard
export const getRecentActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Build filter based on user role
        // Admin users see only data they created
        // SuperAdmin sees all data
        let filter = {};
        
        if (userRole === 'Clinic') {
            filter.createdBy = userId;
        }
        // SuperAdmin sees all data (no filter)

        // Get recent assessments (last 10)
        const recentAssessments = await RequestAssessment.find(filter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select('patientName assessmentType status assessmentDate createdAt')
            .lean();

        // Get recently added patients (last 10)
        const recentPatients = await Patient.find(filter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email phone createdAt')
            .lean();

        // Get recently added doctors (last 10)
        const recentDoctors = await Doctor.find(filter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email phone specialization createdAt')
            .lean();

        res.status(200).json({
            success: true,
            activity: {
                recentAssessments: recentAssessments || [],
                recentPatients: recentPatients || [],
                recentDoctors: recentDoctors || []
            }
        });

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity',
            error: error.message
        });
    }
};

