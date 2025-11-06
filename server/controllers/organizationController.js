import Organization from '../models/Organization.js';
import User from '../models/User.js';

// Get organization details for current user
export const getOrganization = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        let organization;
        
        if (userRole === 'SuperAdmin') {
            // SuperAdmin owns the organization
            organization = await Organization.findOne({ superAdmin: userId })
                .populate('superAdmin', 'name email phone username');
        } else if (userRole === 'Clinic') {
            // Admin is linked to an organization through their user record
            const user = await User.findById(userId).populate('organization');
            if (user.organization) {
                organization = await Organization.findById(user.organization)
                    .populate('superAdmin', 'name email phone');
            }
        }
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'No organization found for this user'
            });
        }
        
        res.json({
            success: true,
            data: organization
        });
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organization details',
            error: error.message
        });
    }
};

// Create organization (Admin and SuperAdmin)
export const createOrganization = async (req, res) => {
    try {
        const {
            organizationName,
            emailAddress,
            phoneNumber,
            address,
            contractStartDate,
            contractEndDate,
            contractDurationMonths,
            gracePeriodDays,
            contactPersonName,
            contactPersonEmail,
            contactPersonPhone
        } = req.body;
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Check if user already has an organization
        const existingOrg = await Organization.findOne({ superAdmin: userId });
        if (existingOrg) {
            return res.status(400).json({
                success: false,
                message: 'You already have an organization'
            });
        }
        
        // Auto-fill details based on user role and existing data
        const user = await User.findById(userId);
        const duration = contractDurationMonths || 12; // Default 1 year
        const startDate = contractStartDate ? new Date(contractStartDate) : new Date();
        const endDate = contractEndDate ? new Date(contractEndDate) : new Date(startDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
        
        const autoFilledData = {
            organizationName: organizationName || user.organizationName || 'My Organization',
            emailAddress: emailAddress || user.email,
            phoneNumber: phoneNumber || user.phone || '',
            address: address || '',
            contractStartDate: startDate,
            contractEndDate: endDate,
            contractDurationMonths: duration,
            gracePeriodDays: gracePeriodDays || 7,
            contactPersonName: contactPersonName || user.name || user.email,
            contactPersonEmail: contactPersonEmail || user.email,
            contactPersonPhone: contactPersonPhone || user.phone || '',
            superAdmin: userId,
            createdBy: userId
        };
        
        const organization = new Organization(autoFilledData);
        await organization.save();
        
        // Update user's organization reference
        await User.findByIdAndUpdate(userId, {
            organization: organization._id,
            organizationName: autoFilledData.organizationName
        });
        
        const populatedOrg = await Organization.findById(organization._id)
            .populate('superAdmin', 'name email phone');
        
        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: populatedOrg
        });
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating organization',
            error: error.message
        });
    }
};

// Update organization (Editable fields only)
export const updateOrganization = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        let organization;
        
        if (userRole === 'SuperAdmin') {
            // SuperAdmin owns the organization
            organization = await Organization.findOne({ superAdmin: userId });
        } else if (userRole === 'Clinic') {
            // Admin is linked to an organization through their user record
            const user = await User.findById(userId).populate('organization');
            if (user.organization) {
                organization = await Organization.findById(user.organization);
            }
        }
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'No organization found for this user'
            });
        }
        
        // Only allow updating specific fields (not contract info)
        const allowedUpdates = [
            'organizationName',
            'emailAddress',
            'phoneNumber',
            'address',
            'contactPersonName',
            'contactPersonEmail',
            'contactPersonPhone'
        ];
        
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        updates.updatedBy = userId;
        
        const updatedOrganization = await Organization.findByIdAndUpdate(
            organization._id,
            updates,
            { new: true, runValidators: true }
        ).populate('superAdmin', 'name email phone');
        
        // Update user's organizationName if changed
        if (updates.organizationName) {
            await User.findByIdAndUpdate(userId, {
                organizationName: updates.organizationName
            });
        }
        
        res.json({
            success: true,
            message: 'Organization updated successfully',
            data: updatedOrganization
        });
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating organization',
            error: error.message
        });
    }
};

// Update contract information (SuperAdmin only)
export const updateContractInfo = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { 
            contractStartDate, 
            contractEndDate, 
            contractDurationMonths,
            contractStatus,
            gracePeriodDays
        } = req.body;
        
        const organization = await Organization.findById(organizationId);
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Save to history if contract dates are changing
        if (contractStartDate || contractEndDate || contractDurationMonths) {
            organization.contractHistory.push({
                startDate: organization.contractStartDate,
                endDate: organization.contractEndDate,
                durationMonths: organization.contractDurationMonths,
                renewedBy: req.user.id,
                renewedAt: new Date(),
                notes: 'Contract updated by SuperAdmin'
            });
        }
        
        const updates = {
            updatedBy: req.user.id
        };
        
        if (contractStartDate) updates.contractStartDate = new Date(contractStartDate);
        if (contractDurationMonths) {
            updates.contractDurationMonths = contractDurationMonths;
            // Calculate end date based on duration if not explicitly provided
            if (!contractEndDate) {
                const start = contractStartDate ? new Date(contractStartDate) : organization.contractStartDate;
                updates.contractEndDate = new Date(start.getTime() + contractDurationMonths * 30 * 24 * 60 * 60 * 1000);
            }
        }
        if (contractEndDate) updates.contractEndDate = new Date(contractEndDate);
        if (contractStatus) updates.contractStatus = contractStatus;
        if (gracePeriodDays !== undefined) updates.gracePeriodDays = gracePeriodDays;
        
        const updatedOrganization = await Organization.findByIdAndUpdate(
            organizationId,
            { $set: updates, $push: { contractHistory: organization.contractHistory[organization.contractHistory.length - 1] } },
            { new: true, runValidators: true }
        ).populate('superAdmin', 'name email phone');
        
        res.json({
            success: true,
            message: 'Contract information updated successfully',
            data: updatedOrganization
        });
    } catch (error) {
        console.error('Error updating contract info:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contract information',
            error: error.message
        });
    }
};

// Get all organizations (SuperAdmin only) - Shows all Admin organizations for contract management
export const getAllOrganizations = async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query; // Increased default limit
        
        const skip = (page - 1) * limit;
        
        // Get all organizations
        const organizations = await Organization.find()
            .populate('superAdmin', 'name email phone isActive')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // For each organization, get associated Admin users and calculate contract status
        const enrichedOrganizations = await Promise.all(
            organizations.map(async (org) => {
                // Find Admin users linked to this organization
                const adminUsers = await User.find({ 
                    organization: org._id,
                    role: 'Clinic'
                }).select('name email phone isActive lastLogin');
                
                // Calculate contract status
                const isValid = org.isContractValid();
                const isInGracePeriod = org.isInGracePeriod();
                const daysUntilExpiry = org.getDaysUntilExpiry();
                const pendingRenewalRequests = org.renewalRequests.filter(r => r.status === 'Pending').length;
                
                return {
                    ...org.toObject(),
                    adminUsers: adminUsers,
                    adminCount: adminUsers.length,
                    contractValidity: {
                        isValid,
                        isInGracePeriod,
                        daysUntilExpiry,
                        pendingRenewalRequests
                    }
                };
            })
        );
        
        const total = await Organization.countDocuments();
        
        res.json({
            success: true,
            data: enrichedOrganizations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organizations',
            error: error.message
        });
    }
};

// Request contract renewal (Admin only)
export const requestContractRenewal = async (req, res) => {
    try {
        const { message, requestedDurationMonths } = req.body;
        const userId = req.user.id;
        
        // Get user's organization
        const user = await User.findById(userId).populate('organization');
        
        if (!user.organization) {
            return res.status(404).json({
                success: false,
                message: 'No organization found for this user'
            });
        }
        
        const organization = await Organization.findById(user.organization._id);
        
        // Add renewal request
        organization.renewalRequests.push({
            requestedBy: userId,
            requestedByName: user.name || user.email,
            requestedByEmail: user.email,
            message: message || 'Request for contract renewal',
            requestedDurationMonths: requestedDurationMonths || 12,
            status: 'Pending'
        });
        
        // Update contract status to PendingRenewal if expired
        if (organization.contractStatus === 'Expired') {
            organization.contractStatus = 'PendingRenewal';
        }
        
        await organization.save();
        
        res.json({
            success: true,
            message: 'Contract renewal request submitted successfully. SuperAdmin will review your request.',
            data: organization.renewalRequests[organization.renewalRequests.length - 1]
        });
    } catch (error) {
        console.error('Error requesting contract renewal:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting renewal request',
            error: error.message
        });
    }
};

// Approve contract renewal (SuperAdmin only)
export const approveContractRenewal = async (req, res) => {
    try {
        const { organizationId, requestId } = req.params;
        const { durationMonths, notes } = req.body;
        const superAdminId = req.user.id;
        
        const organization = await Organization.findById(organizationId);
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Find the renewal request
        const renewalRequest = organization.renewalRequests.id(requestId);
        
        if (!renewalRequest) {
            return res.status(404).json({
                success: false,
                message: 'Renewal request not found'
            });
        }
        
        if (renewalRequest.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }
        
        // Save current contract to history
        organization.contractHistory.push({
            startDate: organization.contractStartDate,
            endDate: organization.contractEndDate,
            durationMonths: organization.contractDurationMonths,
            renewedBy: superAdminId,
            renewedAt: new Date(),
            notes: notes || 'Contract renewed'
        });
        
        // Update contract
        const finalDuration = durationMonths || renewalRequest.requestedDurationMonths || 12;
        organization.contractStartDate = new Date();
        organization.contractEndDate = new Date(Date.now() + finalDuration * 30 * 24 * 60 * 60 * 1000);
        organization.contractDurationMonths = finalDuration;
        organization.contractStatus = 'Active';
        
        // Update renewal request
        renewalRequest.status = 'Approved';
        renewalRequest.reviewedBy = superAdminId;
        renewalRequest.reviewedAt = new Date();
        renewalRequest.reviewNotes = notes || 'Approved';
        
        organization.updatedBy = superAdminId;
        await organization.save();
        
        res.json({
            success: true,
            message: 'Contract renewal approved successfully',
            data: organization
        });
    } catch (error) {
        console.error('Error approving contract renewal:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving renewal request',
            error: error.message
        });
    }
};

// Reject contract renewal (SuperAdmin only)
export const rejectContractRenewal = async (req, res) => {
    try {
        const { organizationId, requestId } = req.params;
        const { notes } = req.body;
        const superAdminId = req.user.id;
        
        const organization = await Organization.findById(organizationId);
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Find the renewal request
        const renewalRequest = organization.renewalRequests.id(requestId);
        
        if (!renewalRequest) {
            return res.status(404).json({
                success: false,
                message: 'Renewal request not found'
            });
        }
        
        if (renewalRequest.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }
        
        // Update renewal request
        renewalRequest.status = 'Rejected';
        renewalRequest.reviewedBy = superAdminId;
        renewalRequest.reviewedAt = new Date();
        renewalRequest.reviewNotes = notes || 'Rejected';
        
        organization.updatedBy = superAdminId;
        await organization.save();
        
        res.json({
            success: true,
            message: 'Contract renewal request rejected',
            data: organization
        });
    } catch (error) {
        console.error('Error rejecting contract renewal:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting renewal request',
            error: error.message
        });
    }
};

// Get contract status (Admin only)
export const getContractStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // SuperAdmin does not have contracts - they manage Admin contracts
        if (userRole === 'SuperAdmin') {
            return res.status(400).json({
                success: false,
                message: 'SuperAdmin does not have contracts. Use getAllOrganizations to manage Admin contracts.'
            });
        }
        
        // Only Admin users have contracts
        const user = await User.findById(userId).populate('organization');
        const organization = user.organization;
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'No organization found for this Admin user'
            });
        }
        
        const isValid = organization.isContractValid();
        const isInGracePeriod = organization.isInGracePeriod();
        const daysUntilExpiry = organization.getDaysUntilExpiry();
        
        res.json({
            success: true,
            data: {
                organizationName: organization.organizationName,
                contractStartDate: organization.contractStartDate,
                contractEndDate: organization.contractEndDate,
                contractDurationMonths: organization.contractDurationMonths,
                contractStatus: organization.contractStatus,
                gracePeriodDays: organization.gracePeriodDays,
                isValid: isValid,
                isInGracePeriod: isInGracePeriod,
                daysUntilExpiry: daysUntilExpiry,
                pendingRenewalRequests: organization.renewalRequests.filter(r => r.status === 'Pending').length,
                renewalRequests: organization.renewalRequests
            }
        });
    } catch (error) {
        console.error('Error fetching contract status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contract status',
            error: error.message
        });
    }
};

// Extend contract (SuperAdmin only) - Add more time
export const extendContract = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { additionalMonths, notes } = req.body;
        
        if (!additionalMonths || additionalMonths < 1) {
            return res.status(400).json({
                success: false,
                message: 'Additional months must be at least 1'
            });
        }
        
        const organization = await Organization.findById(organizationId);
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Save to history
        organization.contractHistory.push({
            startDate: organization.contractStartDate,
            endDate: organization.contractEndDate,
            durationMonths: organization.contractDurationMonths,
            renewedBy: req.user.id,
            renewedAt: new Date(),
            notes: notes || `Contract extended by ${additionalMonths} months`
        });
        
        // Extend the contract
        const newEndDate = new Date(organization.contractEndDate.getTime() + additionalMonths * 30 * 24 * 60 * 60 * 1000);
        organization.contractEndDate = newEndDate;
        organization.contractDurationMonths += additionalMonths;
        organization.contractStatus = 'Active';
        organization.updatedBy = req.user.id;
        
        await organization.save();
        
        res.json({
            success: true,
            message: `Contract extended by ${additionalMonths} months successfully`,
            data: organization
        });
    } catch (error) {
        console.error('Error extending contract:', error);
        res.status(500).json({
            success: false,
            message: 'Error extending contract',
            error: error.message
        });
    }
};

// Reduce contract (SuperAdmin only) - Reduce time
export const reduceContract = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { reduceMonths, notes } = req.body;
        
        if (!reduceMonths || reduceMonths < 1) {
            return res.status(400).json({
                success: false,
                message: 'Reduce months must be at least 1'
            });
        }
        
        const organization = await Organization.findById(organizationId);
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Save to history
        organization.contractHistory.push({
            startDate: organization.contractStartDate,
            endDate: organization.contractEndDate,
            durationMonths: organization.contractDurationMonths,
            renewedBy: req.user.id,
            renewedAt: new Date(),
            notes: notes || `Contract reduced by ${reduceMonths} months`
        });
        
        // Reduce the contract
        const newEndDate = new Date(organization.contractEndDate.getTime() - reduceMonths * 30 * 24 * 60 * 60 * 1000);
        
        // Make sure new end date is not before start date
        if (newEndDate <= organization.contractStartDate) {
            return res.status(400).json({
                success: false,
                message: 'Cannot reduce contract below start date'
            });
        }
        
        organization.contractEndDate = newEndDate;
        organization.contractDurationMonths = Math.max(1, organization.contractDurationMonths - reduceMonths);
        
        // Update status if contract becomes expired
        if (newEndDate < new Date()) {
            organization.contractStatus = 'Expired';
        }
        
        organization.updatedBy = req.user.id;
        await organization.save();
        
        res.json({
            success: true,
            message: `Contract reduced by ${reduceMonths} months successfully`,
            data: organization
        });
    } catch (error) {
        console.error('Error reducing contract:', error);
        res.status(500).json({
            success: false,
            message: 'Error reducing contract',
            error: error.message
        });
    }
};

