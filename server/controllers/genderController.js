import Gender from "../models/Gender.js";

// Create new gender
export const createGender = async (req, res, next) => {
    try {
        const { name, description, status } = req.body;

        // Check if gender with same name already exists
        const existingGender = await Gender.findOne({ name });

        if (existingGender) {
            return res.status(400).json({ 
                message: "Gender with this name already exists"
            });
        }

        const newGender = new Gender({
            name,
            description,
            status: status || 'active',
            createdBy: req.user.id
        });

        const saved = await newGender.save();
        res.locals.targetId = saved._id; // for audit log
        res.status(201).json({ 
            message: "Gender created successfully", 
            gender: saved 
        });
        
    } catch (err) {
        console.error("Error creating gender:", err);
        return res.status(500).json({ message: "Error creating gender" });
    }
};

// Get all genders
export const getAllGenders = async (req, res, next) => {
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
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        
        const genders = await Gender.find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Gender.countDocuments(query);

        res.json({
            genders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
        
    } catch (err) {
        console.error("Error fetching genders:", err);
        return res.status(500).json({ message: "Error fetching genders" });
    }
};

// Get single gender by ID
export const getGenderById = async (req, res, next) => {
    try {
        const gender = await Gender.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!gender) {
            return res.status(404).json({ message: "Gender not found" });
        }

        res.json({ gender });
        
    } catch (err) {
        console.error("Error fetching gender:", err);
        return res.status(500).json({ message: "Error fetching gender" });
    }
};

// Update gender
export const updateGender = async (req, res, next) => {
    try {
        const { name, description, status } = req.body;
        const genderId = req.params.id;

        // Check if another gender with same name exists
        if (name) {
            const existingGender = await Gender.findOne({
                _id: { $ne: genderId },
                name
            });

            if (existingGender) {
                return res.status(400).json({ 
                    message: "Gender with this name already exists"
                });
            }
        }

        const updateData = {
            ...(name && { name }),
            ...(description && { description }),
            ...(status && { status }),
            updatedBy: req.user.id
        };

        const updated = await Gender.findByIdAndUpdate(
            genderId,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
         .populate('updatedBy', 'name email');

        if (!updated) {
            return res.status(404).json({ message: "Gender not found" });
        }

        res.locals.targetId = updated._id;
        res.json({ 
            message: "Gender updated successfully", 
            gender: updated 
        });
        
    } catch (err) {
        console.error("Error updating gender:", err);
        return res.status(500).json({ message: "Error updating gender" });
    }
};

// Delete gender
export const deleteGender = async (req, res, next) => {
    try {
        const gender = await Gender.findById(req.params.id);

        if (!gender) {
            return res.status(404).json({ message: "Gender not found" });
        }

        // Check if gender is being used in any assessments
        // const Assessment = (await import("../models/Assessment.js")).default;
        // const isInUse = await Assessment.findOne({ 
        //     "patientInfo.gender": gender.name 
        // });

        // if (isInUse) {
        //     return res.status(400).json({ 
        //         message: "Cannot delete gender. It is currently being used in assessments." 
        //     });
        // }

        await Gender.findByIdAndDelete(req.params.id);
        res.locals.targetId = req.params.id;
        res.json({ message: "Gender deleted successfully" });
        
    } catch (err) {
        console.error("Error deleting gender:", err);
        return res.status(500).json({ message: "Error deleting gender" });
    }
};

// Toggle gender status
export const toggleGenderStatus = async (req, res, next) => {
    try {
        const gender = await Gender.findById(req.params.id);

        if (!gender) {
            return res.status(404).json({ message: "Gender not found" });
        }

        const newStatus = gender.status === 'active' ? 'inactive' : 'active';
        
        const updated = await Gender.findByIdAndUpdate(
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
            message: `Gender ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 
            gender: updated 
        });
        
    } catch (err) {
        console.error("Error toggling gender status:", err);
        return res.status(500).json({ message: "Error updating gender status" });
    }
};
