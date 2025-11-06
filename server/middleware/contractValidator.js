import User from "../models/User.js";
import Organization from "../models/Organization.js";

/**
 * Middleware to validate contract status for Admin users
 * SuperAdmin users are exempt from contract checks
 * Blocks all actions if contract is expired (beyond grace period)
 */
export const validateContract = async (req, res, next) => {
    try {
        // Skip contract check for SuperAdmin
        if (req.user && req.user.role === 'SuperAdmin') {
            return next();
        }

        // Skip contract check for non-Admin users
        if (!req.user || req.user.role !== 'Clinic') {
            return next();
        }

        // Get user's organization
        const user = await User.findById(req.user.id).populate('organization');
        
        if (!user.organization) {
            return res.status(403).json({
                success: false,
                message: 'No organization assigned. Please contact SuperAdmin.',
                contractExpired: true,
                reason: 'NO_ORGANIZATION'
            });
        }

        const organization = user.organization;
        
        // Check if contract is valid (including grace period)
        if (!organization.isContractValid()) {
            const daysUntilExpiry = organization.getDaysUntilExpiry();
            const isInGracePeriod = organization.isInGracePeriod();
            
            return res.status(403).json({
                success: false,
                message: isInGracePeriod 
                    ? `Your contract has expired. You are in a ${organization.gracePeriodDays}-day grace period. Please contact your administrator to renew.`
                    : 'Your contract has expired. Please renew to continue using the system.',
                contractExpired: true,
                contractInfo: {
                    organizationName: organization.organizationName,
                    contractEndDate: organization.contractEndDate,
                    contractStatus: organization.contractStatus,
                    daysUntilExpiry: daysUntilExpiry,
                    isInGracePeriod: isInGracePeriod,
                    gracePeriodDays: organization.gracePeriodDays
                }
            });
        }

        // Warn if contract is expiring soon (within 30 days)
        const daysUntilExpiry = organization.getDaysUntilExpiry();
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            // Attach warning to response (doesn't block the request)
            res.locals.contractWarning = {
                message: `Your contract will expire in ${daysUntilExpiry} days. Please plan for renewal.`,
                daysUntilExpiry: daysUntilExpiry,
                contractEndDate: organization.contractEndDate
            };
        }

        // Attach organization to request for later use
        req.organization = organization;
        next();
    } catch (error) {
        console.error('Contract validation error:', error);
        // Don't block request on validation errors, just log
        next();
    }
};

/**
 * Middleware to attach contract warning to response if exists
 */
export const attachContractWarning = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        if (res.locals.contractWarning && data.success) {
            data.contractWarning = res.locals.contractWarning;
        }
        return originalJson.call(this, data);
    };
    
    next();
};

