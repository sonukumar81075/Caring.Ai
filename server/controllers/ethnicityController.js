import Ethnicity from "../models/Ethnicity.js";

// Create new ethnicity
export const createEthnicity = async(req, res, next) => {
    try {
        const { name, description, status } = req.body;

        // Check if ethnicity with same name already exists
        const existingEthnicity = await Ethnicity.findOne({ name });

        if (existingEthnicity) {
            return res.status(400).json({
                message: "Ethnicity with this name already exists",
            });
        }

        const newEthnicity = new Ethnicity({
            name,
            description,
            status: status || "active",
            createdBy: req.user.id,
        });

        const saved = await newEthnicity.save();
        res.locals.targetId = saved._id; // for audit log
        res.status(201).json({
            message: "Ethnicity created successfully",
            ethnicity: saved,
        });
    } catch (err) {
        console.error("Error creating ethnicity:", err);
        return res.status(500).json({ message: "Error creating ethnicity" });
    }
};

// Get all ethnicities
export const getAllEthnicities = async(req, res, next) => {
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
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const ethnicities = await Ethnicity.find(query)
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Ethnicity.countDocuments(query);

        res.json({
            ethnicities,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (err) {
        console.error("Error fetching ethnicities:", err);
        return res.status(500).json({ message: "Error fetching ethnicities" });
    }
};

// Get single ethnicity by ID
export const getEthnicityById = async(req, res, next) => {
    try {
        const ethnicity = await Ethnicity.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");

        if (!ethnicity) {
            return res.status(404).json({ message: "Ethnicity not found" });
        }

        res.json({ ethnicity });
    } catch (err) {
        console.error("Error fetching ethnicity:", err);
        return res.status(500).json({ message: "Error fetching ethnicity" });
    }
};

// Update ethnicity
export const updateEthnicity = async(req, res, next) => {
    try {
        const { name, description, status } = req.body;
        const ethnicityId = req.params.id;

        // Check if another ethnicity with same name exists
        if (name) {
            const existingEthnicity = await Ethnicity.findOne({
                _id: { $ne: ethnicityId },
                name,
            });

            if (existingEthnicity) {
                return res.status(400).json({
                    message: "Ethnicity with this name already exists",
                });
            }
        }

        const updateData = {
            ...(name && { name }),
            ...(description && { description }),
            ...(status && { status }),
            updatedBy: req.user.id,
        };

        const updated = await Ethnicity.findByIdAndUpdate(ethnicityId, updateData, {
                new: true,
                runValidators: true,
            })
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");

        if (!updated) {
            return res.status(404).json({ message: "Ethnicity not found" });
        }

        res.locals.targetId = updated._id;
        res.json({
            message: "Ethnicity updated successfully",
            ethnicity: updated,
        });
    } catch (err) {
        console.error("Error updating ethnicity:", err);
        return res.status(500).json({ message: "Error updating ethnicity" });
    }
};

// Delete ethnicity
export const deleteEthnicity = async(req, res, next) => {
    try {
        const ethnicity = await Ethnicity.findById(req.params.id);

        if (!ethnicity) {
            return res.status(404).json({ message: "Ethnicity not found" });
        }

        // Check if ethnicity is being used in any assessments
        // const Assessment = (await import("../models/Assessment.js")).default;
        // const isInUse = await Assessment.findOne({ 
        //     "patientInfo.ethnicity": ethnicity.name 
        // });

        // if (isInUse) {
        //     return res.status(400).json({ 
        //         message: "Cannot delete ethnicity. It is currently being used in assessments." 
        //     });
        // }

        await Ethnicity.findByIdAndDelete(req.params.id);
        res.locals.targetId = req.params.id;
        res.json({ message: "Ethnicity deleted successfully" });

    } catch (err) {
        console.error("Error deleting ethnicity:", err);
        return res.status(500).json({ message: "Error deleting ethnicity" });
    }
};

// Toggle ethnicity status
export const toggleEthnicityStatus = async(req, res, next) => {
    try {
        const ethnicity = await Ethnicity.findById(req.params.id);

        if (!ethnicity) {
            return res.status(404).json({ message: "Ethnicity not found" });
        }

        const newStatus = ethnicity.status === "active" ? "inactive" : "active";

        const updated = await Ethnicity.findByIdAndUpdate(
                req.params.id, {
                    status: newStatus,
                    updatedBy: req.user.id,
                }, { new: true, runValidators: true }
            )
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");

        res.locals.targetId = updated._id;
        res.json({
            message: `Ethnicity ${
        newStatus === "active" ? "activated" : "deactivated"
      } successfully`,
            ethnicity: updated,
        });
    } catch (err) {
        console.error("Error toggling ethnicity status:", err);
        return res.status(500).json({ message: "Error updating ethnicity status" });
    }
};