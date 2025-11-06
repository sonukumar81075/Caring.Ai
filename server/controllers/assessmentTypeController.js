import AssessmentType from "../models/AssessmentType.js";

// Create new assessment type
export const createAssessmentType = async (req, res, next) => {
    try {
        const { name, agentId, description, status } = req.body;

        // Check if assessment type with same name or agentId already exists
        const existingType = await AssessmentType.findOne({
            $or: [{ name }, { agentId }]
        });

        if (existingType) {
            return res.status(400).json({ 
                message: existingType.name === name 
                    ? "Assessment type with this name already exists" 
                    : "Assessment type with this Agent ID already exists"
            });
        }

        const newAssessmentType = new AssessmentType({
            name,
            agentId,
            description,
            status: status || 'active',
            createdBy: req.user.id
        });

        const saved = await newAssessmentType.save();
        res.locals.targetId = saved._id; // for audit log
        res.status(201).json({ 
            message: "Assessment type created successfully", 
            assessmentType: saved 
        });
        
    } catch (err) {
        console.error("Error creating assessment type:", err);
        return res.status(500).json({ message: "Error creating assessment type" });
    }
};

// Get all assessment types
export const getAllAssessmentTypes = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;
        
        let query = {};
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { agentId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        
        const assessmentTypes = await AssessmentType.find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AssessmentType.countDocuments(query);

        res.json({
            assessmentTypes,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
        
    } catch (err) {
        console.error("Error fetching assessment types:", err);
        return res.status(500).json({ message: "Error fetching assessment types" });
    }
};

// Get single assessment type by ID
export const getAssessmentTypeById = async (req, res, next) => {
    try {
        const assessmentType = await AssessmentType.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!assessmentType) {
            return res.status(404).json({ message: "Assessment type not found" });
        }

        res.json({ assessmentType });
        
    } catch (err) {
        console.error("Error fetching assessment type:", err);
        return res.status(500).json({ message: "Error fetching assessment type" });
    }
};

// Update assessment type
export const updateAssessmentType = async (req, res, next) => {
    try {
        const { name, agentId, description, status } = req.body;
        const assessmentTypeId = req.params.id;

        // Check if another assessment type with same name or agentId exists
        if (name || agentId) {
            const existingType = await AssessmentType.findOne({
                _id: { $ne: assessmentTypeId },
                $or: [
                    ...(name ? [{ name }] : []),
                    ...(agentId ? [{ agentId }] : [])
                ]
            });

            if (existingType) {
                return res.status(400).json({ 
                    message: existingType.name === name 
                        ? "Assessment type with this name already exists" 
                        : "Assessment type with this Agent ID already exists"
                });
            }
        }

        const updateData = {
            ...(name && { name }),
            ...(agentId && { agentId }),
            ...(description && { description }),
            ...(status && { status }),
            updatedBy: req.user.id
        };

        const updated = await AssessmentType.findByIdAndUpdate(
            assessmentTypeId,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
         .populate('updatedBy', 'name email');

        if (!updated) {
            return res.status(404).json({ message: "Assessment type not found" });
        }

        res.locals.targetId = updated._id;
        res.json({ 
            message: "Assessment type updated successfully", 
            assessmentType: updated 
        });
        
    } catch (err) {
        console.error("Error updating assessment type:", err);
        return res.status(500).json({ message: "Error updating assessment type" });
    }
};

// Delete assessment type
export const deleteAssessmentType = async (req, res, next) => {
    try {
        const assessmentType = await AssessmentType.findById(req.params.id);

        if (!assessmentType) {
            return res.status(404).json({ message: "Assessment type not found" });
        }

        // Check if assessment type is being used in any assessments
        // const Assessment = (await import("../models/Assessment.js")).default;
        // const isInUse = await Assessment.findOne({ 
        //     "assessmentDetails.type": assessmentType.name 
        // });

        // if (isInUse) {
        //     return res.status(400).json({ 
        //         message: "Cannot delete assessment type. It is currently being used in assessments." 
        //     });
        // }

        await AssessmentType.findByIdAndDelete(req.params.id);
        res.locals.targetId = req.params.id;
        res.json({ message: "Assessment type deleted successfully" });
        
    } catch (err) {
        console.error("Error deleting assessment type:", err);
        return res.status(500).json({ message: "Error deleting assessment type" });
    }
};

// Toggle assessment type status
export const toggleAssessmentTypeStatus = async (req, res, next) => {
    try {
        const assessmentType = await AssessmentType.findById(req.params.id);

        if (!assessmentType) {
            return res.status(404).json({ message: "Assessment type not found" });
        }

        const newStatus = assessmentType.status === 'active' ? 'inactive' : 'active';
        
        const updated = await AssessmentType.findByIdAndUpdate(
            req.params.id,
            { 
                status: newStatus,
                updatedBy: req.user.id
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
         .populate('updatedBy', 'name email');

        res.locals.targetId = updated._id;
        res.json({ 
            message: `Assessment type ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 
            assessmentType: updated 
        });
        
    } catch (err) {
        console.error("Error toggling assessment type status:", err);
        return res.status(500).json({ message: "Error updating assessment type status" });
    }
};
