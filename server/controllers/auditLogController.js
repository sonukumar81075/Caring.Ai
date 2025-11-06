import AuditLog from "../models/AuditLog.js";

// Get all audit logs with pagination, search, and filtering
export const getAuditLogs = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            action = "",
            recordType = "",
            startDate = "",
            endDate = "",
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        // Build filter object
        const filter = {};

        // Role-based filtering: Both Admin and SuperAdmin can see all logs
        // Admin and SuperAdmin have "audit:read" permission
        // No userId filtering - both can see all audit logs

        // Search filter
        if (search) {
            filter.$or = [
                { action: { $regex: search, $options: "i" } },
                { recordType: { $regex: search, $options: "i" } },
                { ip: { $regex: search, $options: "i" } },
                { userAgent: { $regex: search, $options: "i" } }
            ];
        }

        // Action filter
        if (action) {
            filter.action = { $regex: action, $options: "i" };
        }

        // Record type filter
        if (recordType) {
            filter.recordType = { $regex: recordType, $options: "i" };
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get audit logs with pagination and populate createdBy
        const auditLogs = await AuditLog.find(filter)
            .populate('createdBy', 'name email role')
            .populate('userId', 'name email role')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Process audit logs to extract role information from meta field
        const processedAuditLogs = auditLogs.map(log => {
            const logObj = log.toObject();
            
            // Extract role from meta field if available
            let userRole = 'Unknown';
            let userName = 'System';
            
            if (logObj.meta && logObj.meta.role) {
                userRole = logObj.meta.role;
            }
            
            if (logObj.meta && logObj.meta.userName) {
                userName = logObj.meta.userName;
            } else if (logObj.meta && logObj.meta.email) {
                userName = logObj.meta.email;
            }
            
            // Get createdBy information
            let createdByName = null;
            let createdByEmail = null;
            let createdByRole = null;
            
            if (logObj.createdBy) {
                createdByName = logObj.createdBy.name;
                createdByEmail = logObj.createdBy.email;
                createdByRole = logObj.createdBy.role;
            }
            
            // Return processed log with role and createdBy information
            return {
                ...logObj,
                userRole: userRole,
                userName: userName,
                user: userName, // Override encrypted user field with readable name
                createdByName: createdByName || 'System',
                createdByEmail: createdByEmail || null,
                createdByRole: createdByRole || null,
                meta: {
                    ...logObj.meta,
                    role: userRole
                }
            };
        });

        // Get total count for pagination
        const total = await AuditLog.countDocuments(filter);

        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            success: true,
            data: processedAuditLogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs",
            error: error.message
        });
    }
};

// Get audit log by ID
export const getAuditLogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const auditLog = await AuditLog.findById(id);
        
        if (!auditLog) {
            return res.status(404).json({
                success: false,
                message: "Audit log not found"
            });
        }

        // Process audit log to extract role information from meta field
        const logObj = auditLog.toObject();
        
        // Extract role from meta field if available
        let userRole = 'Unknown';
        let userName = 'System';
        
        if (logObj.meta && logObj.meta.role) {
            userRole = logObj.meta.role;
        }
        
        if (logObj.meta && logObj.meta.userName) {
            userName = logObj.meta.userName;
        } else if (logObj.meta && logObj.meta.email) {
            userName = logObj.meta.email;
        }
        
        // Return processed log with role information
        const processedLog = {
            ...logObj,
            userRole: userRole,
            userName: userName,
            user: userName, // Override encrypted user field with readable name
            meta: {
                ...logObj.meta,
                role: userRole
            }
        };

        res.json({
            success: true,
            data: processedLog
        });
    } catch (error) {
        console.error("Error fetching audit log:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch audit log",
            error: error.message
        });
    }
};

// Get audit log statistics
export const getAuditLogStats = async (req, res, next) => {
    try {
        const { startDate = "", endDate = "" } = req.query;

        // Build date filter
        const dateFilter = {};
        
        // Role-based filtering: Both Admin and SuperAdmin can see all logs
        // Admin and SuperAdmin have "audit:read" permission
        // No userId filtering - both can see all audit logs and stats
        
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                dateFilter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.createdAt.$lte = new Date(endDate);
            }
        }

        // Get statistics
        const [
            totalLogs,
            actionStats,
            recordTypeStats,
            recentLogs
        ] = await Promise.all([
            // Total logs count
            AuditLog.countDocuments(dateFilter),
            
            // Action statistics
            AuditLog.aggregate([
                { $match: dateFilter },
                { $group: { _id: "$action", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            
            // Record type statistics
            AuditLog.aggregate([
                { $match: { ...dateFilter, recordType: { $exists: true, $ne: null } } },
                { $group: { _id: "$recordType", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            
            // Recent logs (last 24 hours)
            AuditLog.find({
                ...dateFilter,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            })
            .sort({ createdAt: -1 })
            .limit(5)
        ]);

        // Process recent logs to extract role information
        const processedRecentLogs = recentLogs.map(log => {
            const logObj = log.toObject();
            
            // Extract role from meta field if available
            let userRole = 'Unknown';
            let userName = 'System';
            
            if (logObj.meta && logObj.meta.role) {
                userRole = logObj.meta.role;
            }
            
            if (logObj.meta && logObj.meta.userName) {
                userName = logObj.meta.userName;
            } else if (logObj.meta && logObj.meta.email) {
                userName = logObj.meta.email;
            }
            
            // Return processed log with role information
            return {
                ...logObj,
                userRole: userRole,
                userName: userName,
                user: userName, // Override encrypted user field with readable name
                meta: {
                    ...logObj.meta,
                    role: userRole
                }
            };
        });

        res.json({
            success: true,
            data: {
                totalLogs,
                actionStats,
                recordTypeStats,
                recentLogs: processedRecentLogs
            }
        });
    } catch (error) {
        console.error("Error fetching audit log statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch audit log statistics",
            error: error.message
        });
    }
};
