import RequestAssessment from '../models/RequestAssessment.js';
import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { sendEmail } from '../utils/sendEmail.js';
import { createAssessmentNotificationEmailTemplate, createPhysicianAssessmentNotificationEmailTemplate } from '../utils/emailTemplates.js';
import { createAssessmentBatchCall } from '../utils/retellService.js';
import { decrypt } from '../utils/fieldEncryption.js';

// Create a new assessment request
export const createRequestAssessment = async(req, res) => {
    try {
        const {
            patientName,
            patientId,
            phoneNumber,
            age,
            gender,
            ethnicity,
            hasCaregiver,
            searchPatient,
            assessmentType,
            assigningPhysician,
            assessmentDate,
            timezone,
            timeHour,
            timeMinute,
            timeAmPm,
            communicationNotes,
            consentAccepted
        } = req.body;

        // Validate required fields
        if (!patientName || !patientId || !phoneNumber || !age || !hasCaregiver ||
            !searchPatient || !assessmentType || !assigningPhysician || !assessmentDate ||
            !timezone || !timeHour || !timeMinute || !timeAmPm) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate consent
        if (!consentAccepted) {
            return res.status(400).json({
                success: false,
                message: 'Consent must be accepted to submit the assessment request'
            });
        }

        // Verify that the assigning physician exists
        const physician = await Doctor.findById(assigningPhysician);
        // return res.status(400).json({
        //   success: false,
        //   message: physician
        // });
        if (!physician) {
            return res.status(400).json({
                success: false,
                message: 'Invalid assigning physician'
            });
        }

        // Create the assessment request
        const requestAssessment = new RequestAssessment({
            patientName,
            patientId,
            phoneNumber,
            age,
            gender, // Optional
            ethnicity, // Optional
            hasCaregiver,
            searchPatient,
            assessmentType,
            assigningPhysician,
            assessmentDate: new Date(assessmentDate),
            timezone,
            timeHour,
            timeMinute,
            timeAmPm,
            communicationNotes, // Optional
            consentAccepted,
            createdBy: req.user.id
        });

        // Create Retell batch call before saving the assessment request
        const retellResult = await createAssessmentBatchCall({
            patientName,
            phoneNumber,
            assessmentType,
            assessmentDate,
            timezone,
            timeHour,
            timeMinute,
            timeAmPm,
        });

        // If Retell batch call fails, return error and do not save the assessment request
        if (!retellResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create assessment batch call',
                error: retellResult.error || 'Unknown error occurred while creating batch call',
                retellError: retellResult.error
            });
        }

        // Add complete Retell batch call data to the assessment request (only if successful)
        if (retellResult.batchCallData) {
            requestAssessment.retellBatchCallData = retellResult.batchCallData;
        }

        // Save the assessment request only after successful Retell batch call
        await requestAssessment.save();

        // Populate the physician information for response
        await requestAssessment.populate('assigningPhysician', 'name email specialty');

        // Send email notification to patient
        // try {
        //   const patient = await Patient.findOne({ patientId: patientId });
        //   if (patient && patient.email) {
        //     const assessmentDateTime = new Date(assessmentDate);
        //     const formattedDate = assessmentDateTime.toLocaleDateString('en-US', {
        //       weekday: 'long',
        //       year: 'numeric',
        //       month: 'long',
        //       day: 'numeric'
        //     });
        //     const formattedTime = `${timeHour}:${timeMinute} ${timeAmPm} ${timezone}`;

        //     await sendEmail(
        //       patient.email,
        //       "New Assessment Request - Caring AI",
        //       createAssessmentNotificationEmailTemplate(
        //         patientName,
        //         physician.name || 'Your Healthcare Provider',
        //         assessmentType || 'Clinical Assessment',
        //         `${formattedDate} at ${formattedTime}`,
        //         communicationNotes || null
        //       )
        //     );
        //   }
        // } catch (emailError) {
        //   // Log email error but don't fail the request
        //   console.error('Error sending patient notification email:', emailError);
        // }

        // Send email notification to assigning physician
        // try {
        //   if (physician && physician.email) {
        //     const assessmentDateTime = new Date(assessmentDate);
        //     const formattedDate = assessmentDateTime.toLocaleDateString('en-US', {
        //       weekday: 'long',
        //       year: 'numeric',
        //       month: 'long',
        //       day: 'numeric'
        //     });
        //     const formattedTime = `${timeHour}:${timeMinute} ${timeAmPm} ${timezone}`;

        //     await sendEmail(
        //       physician.email,
        //       "New Assessment Assignment - Caring AI",
        //       createPhysicianAssessmentNotificationEmailTemplate(
        //         physician.name || 'Doctor',
        //         patientName,
        //         assessmentType || 'Clinical Assessment',
        //         `${formattedDate} at ${formattedTime}`,
        //         communicationNotes || null
        //       )
        //     );
        //   }
        // } catch (emailError) {
        //   // Log email error but don't fail the request
        //   console.error('Error sending physician notification email:', emailError);
        // }

        res.status(201).json({
            success: true,
            message: 'Assessment request submitted successfully',
            data: requestAssessment,
            retellBatchCall: {
                success: retellResult.success,
                batchCallId: retellResult.batchCallId,
                batchCallData: retellResult.batchCallData,
                error: retellResult.error,
                retellResult
            }
        });

    } catch (error) {
        console.error('Error creating assessment request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create assessment request',
            error: error.message
        });
    }
};

// Get all assessment requests with pagination and filtering
export const getRequestAssessments = async(req, res) => {
    try {
        const {
            page = 1,
                limit = 10,
                search,
                status,
                patientName,
                assessmentType,
                assigningPhysician,
                startDate,
                endDate
        } = req.query;

        // Build filter object based on user role (non-encrypted fields only)
        const filter = {};

        if (req.user.role === 'Doctor') {
            // For Doctor role users, find the Doctor document by physicianId and use its _id
            const doctor = await Doctor.findOne({ doctorId: req.user.physicianId });
            if (doctor) {
                filter.assigningPhysician = doctor._id;
            } else {
                // If doctor not found, return empty results
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: parseInt(limit)
                    }
                });
            }
        } else {
            // For Clinic and SuperAdmin users, show self-created assessment requests
            filter.createdBy = req.user.id;
        }

        // Add non-encrypted field filters
        if (status) filter.status = status;
        if (assessmentType) filter.assessmentType = { $regex: assessmentType, $options: 'i' };
        if (assigningPhysician) filter.assigningPhysician = assigningPhysician;

        if (startDate || endDate) {
            filter.assessmentDate = {};
            if (startDate) filter.assessmentDate.$gte = new Date(startDate);
            if (endDate) filter.assessmentDate.$lte = new Date(endDate);
        }

        // Check if we need to filter by encrypted fields (search or patientName)
        const hasEncryptedFilters = search || patientName;
        
        let requestAssessments;
        let totalCount;

        if (hasEncryptedFilters) {
            // Fetch all matching documents (no pagination yet)
            // We need to decrypt and filter in memory
            const allRequestAssessments = await RequestAssessment.find(filter)
                .populate('assigningPhysician', 'name email specialty')
                .populate('createdBy', 'email role')
                .populate('updatedBy', 'email role')
                .sort({ createdAt: -1 })
                .lean(); // Use lean() to get plain objects and access raw encrypted data

            // Filter by encrypted fields after decryption
            const filteredAssessments = allRequestAssessments.filter((assessment) => {
                let matches = true;

                // Handle search across multiple encrypted fields
                if (search) {
                    const searchLower = search.toLowerCase();
                    
                    // Decrypt and check patient name
                    let decryptedPatientName = '';
                    try {
                        decryptedPatientName = decrypt(assessment.patientName) || '';
                    } catch (e) {
                        decryptedPatientName = '';
                    }
                    
                    // Decrypt and check patient ID
                    let decryptedPatientId = '';
                    try {
                        decryptedPatientId = decrypt(assessment.patientId) || '';
                    } catch (e) {
                        decryptedPatientId = '';
                    }
                    
                    // Decrypt and check phone number
                    let decryptedPhoneNumber = '';
                    try {
                        decryptedPhoneNumber = decrypt(assessment.phoneNumber) || '';
                    } catch (e) {
                        decryptedPhoneNumber = '';
                    }

                    // Check if search matches any decrypted field
                    const matchesSearch = 
                        decryptedPatientName.toLowerCase().includes(searchLower) ||
                        decryptedPatientId.toLowerCase().includes(searchLower) ||
                        decryptedPhoneNumber.toLowerCase().includes(searchLower);

                    // Check physician name (not encrypted)
                    const physicianName = assessment.assigningPhysician?.name || '';
                    const matchesPhysician = physicianName.toLowerCase().includes(searchLower);

                    if (!matchesSearch && !matchesPhysician) {
                        matches = false;
                    }
                }

                // Handle patientName filter
                if (patientName && matches) {
                    let decryptedPatientName = '';
                    try {
                        decryptedPatientName = decrypt(assessment.patientName) || '';
                    } catch (e) {
                        decryptedPatientName = '';
                    }
                    
                    if (!decryptedPatientName.toLowerCase().includes(patientName.toLowerCase())) {
                        matches = false;
                    }
                }

                return matches;
            });

            // Apply pagination after filtering
            totalCount = filteredAssessments.length;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const paginatedAssessments = filteredAssessments.slice(skip, skip + parseInt(limit));

            // Convert lean results back to mongoose documents with decrypted fields
            // Fetch documents again to get getters applied (auto-decryption via model getters)
            const docIds = paginatedAssessments.map(doc => doc._id);
            requestAssessments = await RequestAssessment.find({ _id: { $in: docIds } })
                .populate('assigningPhysician', 'name email specialty')
                .populate('createdBy', 'email role')
                .populate('updatedBy', 'email role')
                .sort({ createdAt: -1 }); // Maintain sort order
        } else {
            // No encrypted field filters - use normal MongoDB query with pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            requestAssessments = await RequestAssessment.find(filter)
                .populate('assigningPhysician', 'name email specialty')
                .populate('createdBy', 'email role')
                .populate('updatedBy', 'email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            totalCount = await RequestAssessment.countDocuments(filter);
        }

        res.json({
            success: true,
            data: requestAssessments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching assessment requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessment requests',
            error: error.message
        });
    }
};

// Get assessment request by ID
export const getRequestAssessmentById = async(req, res) => {
    try {
        const { id } = req.params;

        // Build filter based on user role (same logic as getAssessmentResults)
        let filter = { _id: id };

        if (req.user.role === 'Doctor') {
            // For Doctor role users, find the Doctor document by physicianId and use its _id
            const doctor = await Doctor.findOne({ doctorId: req.user.physicianId });
            if (doctor) {
                filter.assigningPhysician = doctor._id;
            } else {
                // If doctor not found, return 404
                return res.status(404).json({
                    success: false,
                    message: 'Assessment request not found'
                });
            }
        } else {
            // For Clinic and SuperAdmin users, show self-created assessment requests
            filter.createdBy = req.user.id;
        }

        const requestAssessment = await RequestAssessment.findOne(filter)
            .populate('assigningPhysician', 'name email specialty phone')
            .populate('createdBy', 'email role')
            .populate('updatedBy', 'email role');

        if (!requestAssessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment request not found'
            });
        }

        res.json({
            success: true,
            data: requestAssessment
        });

    } catch (error) {
        console.error('Error fetching assessment request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessment request',
            error: error.message
        });
    }
};

// Update assessment request status
export const updateRequestAssessmentStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!status || !['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // First check if the assessment request exists and belongs to current user
        const existingRequest = await RequestAssessment.findOne({
            _id: id,
            createdBy: req.user.id
        });

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: 'Assessment request not found'
            });
        }

        const requestAssessment = await RequestAssessment.findByIdAndUpdate(
                id, {
                    status,
                    updatedBy: req.user.id,
                    updatedAt: new Date()
                }, { new: true }
            ).populate('assigningPhysician', 'name email specialty')
            .populate('createdBy', 'email role')
            .populate('updatedBy', 'email role');

        if (!requestAssessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment request not found'
            });
        }

        res.json({
            success: true,
            message: 'Assessment request status updated successfully',
            data: requestAssessment
        });

    } catch (error) {
        console.error('Error updating assessment request status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update assessment request status',
            error: error.message
        });
    }
};

// Delete assessment request
export const deleteRequestAssessment = async(req, res) => {
    try {
        const { id } = req.params;

        // First check if the assessment request exists and belongs to current user
        const existingRequest = await RequestAssessment.findOne({
            _id: id,
            createdBy: req.user.id
        });

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: 'Assessment request not found'
            });
        }

        const requestAssessment = await RequestAssessment.findByIdAndDelete(id);

        if (!requestAssessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment request not found'
            });
        }

        res.json({
            success: true,
            message: 'Assessment request deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting assessment request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete assessment request',
            error: error.message
        });
    }
};

// Get assessment request statistics
export const getRequestAssessmentStats = async(req, res) => {
    try {
        const baseFilter = { createdBy: req.user.id }; // Only count self-created requests

        const stats = await RequestAssessment.aggregate([
            { $match: baseFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalRequests = await RequestAssessment.countDocuments(baseFilter);
        const pendingRequests = await RequestAssessment.countDocuments({...baseFilter, status: 'pending' });
        const approvedRequests = await RequestAssessment.countDocuments({...baseFilter, status: 'approved' });
        const completedRequests = await RequestAssessment.countDocuments({...baseFilter, status: 'completed' });

        res.json({
            success: true,
            data: {
                totalRequests,
                pendingRequests,
                approvedRequests,
                completedRequests,
                statusBreakdown: stats
            }
        });

    } catch (error) {
        console.error('Error fetching assessment request statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessment request statistics',
            error: error.message
        });
    }
};

// Get assessment results for the Assessment Results & Management page
export const getAssessmentResults = async(req, res) => {
    try {
        const {
            page = 1,
                limit = 10,
                search,
                status,
                patientName,
                assessmentType,
                assigningPhysician,
                startDate,
                endDate
        } = req.query;

        // Build filter object based on user role (non-encrypted fields only)
        const filter = {};

        if (req.user.role === 'Doctor') {
            // For Doctor role users, find the Doctor document by physicianId and use its _id
            const doctor = await Doctor.findOne({ doctorId: req.user.physicianId });
            if (doctor) {
                filter.assigningPhysician = doctor._id;
            } else {
                // If doctor not found, return empty results
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: parseInt(limit)
                    }
                });
            }
        } else {
            // For Clinic and SuperAdmin users, show self-created assessment requests
            filter.createdBy = req.user.id;
        }

        // Add non-encrypted field filters
        if (status) filter.status = status;
        if (assessmentType) filter.assessmentType = { $regex: assessmentType, $options: 'i' };
        if (assigningPhysician) filter.assigningPhysician = assigningPhysician;

        if (startDate || endDate) {
            filter.assessmentDate = {};
            if (startDate) filter.assessmentDate.$gte = new Date(startDate);
            if (endDate) filter.assessmentDate.$lte = new Date(endDate);
        }

        // Check if we need to filter by encrypted fields (search or patientName)
        const hasEncryptedFilters = search || patientName;
        
        let requestAssessments;
        let totalCount;

        if (hasEncryptedFilters) {
            // Fetch all matching documents (no pagination yet)
            // We need to decrypt and filter in memory
            const allRequestAssessments = await RequestAssessment.find(filter)
                .populate('assigningPhysician', 'name email specialty')
                .populate('createdBy', 'email role')
                .populate('updatedBy', 'email role')
                .sort({ createdAt: -1 })
                .lean(); // Use lean() to get plain objects and access raw encrypted data

            // Filter by encrypted fields after decryption
            const filteredAssessments = allRequestAssessments.filter((assessment) => {
                let matches = true;

                // Handle search across multiple encrypted fields
                if (search) {
                    const searchLower = search.toLowerCase();
                    
                    // Decrypt and check patient name
                    let decryptedPatientName = '';
                    try {
                        decryptedPatientName = decrypt(assessment.patientName) || '';
                    } catch (e) {
                        decryptedPatientName = '';
                    }
                    
                    // Decrypt and check patient ID
                    let decryptedPatientId = '';
                    try {
                        decryptedPatientId = decrypt(assessment.patientId) || '';
                    } catch (e) {
                        decryptedPatientId = '';
                    }
                    
                    // Decrypt and check phone number
                    let decryptedPhoneNumber = '';
                    try {
                        decryptedPhoneNumber = decrypt(assessment.phoneNumber) || '';
                    } catch (e) {
                        decryptedPhoneNumber = '';
                    }

                    // Check if search matches any decrypted field
                    const matchesSearch = 
                        decryptedPatientName.toLowerCase().includes(searchLower) ||
                        decryptedPatientId.toLowerCase().includes(searchLower) ||
                        decryptedPhoneNumber.toLowerCase().includes(searchLower);

                    // Check physician name (not encrypted)
                    const physicianName = assessment.assigningPhysician?.name || '';
                    const matchesPhysician = physicianName.toLowerCase().includes(searchLower);

                    if (!matchesSearch && !matchesPhysician) {
                        matches = false;
                    }
                }

                // Handle patientName filter
                if (patientName && matches) {
                    let decryptedPatientName = '';
                    try {
                        decryptedPatientName = decrypt(assessment.patientName) || '';
                    } catch (e) {
                        decryptedPatientName = '';
                    }
                    
                    if (!decryptedPatientName.toLowerCase().includes(patientName.toLowerCase())) {
                        matches = false;
                    }
                }

                return matches;
            });

            // Apply pagination after filtering
            totalCount = filteredAssessments.length;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const paginatedAssessments = filteredAssessments.slice(skip, skip + parseInt(limit));

            // Convert lean results back to mongoose documents with decrypted fields
            // Fetch documents again to get getters applied (auto-decryption via model getters)
            const docIds = paginatedAssessments.map(doc => doc._id);
            requestAssessments = await RequestAssessment.find({ _id: { $in: docIds } })
                .populate('assigningPhysician', 'name email specialty')
                .populate('createdBy', 'email role')
                .populate('updatedBy', 'email role')
                .sort({ createdAt: -1 }); // Maintain sort order
        } else {
            // No encrypted field filters - use normal MongoDB query with pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            requestAssessments = await RequestAssessment.find(filter)
                .populate('assigningPhysician', 'name email specialty')
                .populate('createdBy', 'email role')
                .populate('updatedBy', 'email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            totalCount = await RequestAssessment.countDocuments(filter);
        }

        // Collect batch_call_ids to fetch recording URLs from retell-call-data in bulk
        const batchCallIds = requestAssessments
            .map(a => a?.retellBatchCallData?.batch_call_id)
            .filter(Boolean);

        let recordingByBatchId = {};
        if (batchCallIds.length > 0) {
            try {
                const db = mongoose.connection?.db;
                if (db) {
                    const retellColl = db.collection('retell-call-data');
                    // Match retell docs where call.call_id equals our batch_call_id
                    const retellDocs = await retellColl
                        .find({
                            $or: [
                                { batch_call_id: { $in: batchCallIds } },
                                { batch_id: { $in: batchCallIds } },
                                { 'call.batch_call_id': { $in: batchCallIds } },
                                { 'call.call_id': { $in: batchCallIds } }
                            ]
                        })
                        .project({
                            batch_call_id: 1,
                            batch_id: 1,
                            'call.batch_call_id': 1,
                            'call.call_id': 1,
                            'call.recording_url': 1
                        })
                        .toArray();
                        for (const doc of retellDocs) {
                          const key = doc.batch_call_id || doc.batch_id || doc?.call?.batch_call_id || doc?.call?.call_id;
                          if (key) {
                            recordingByBatchId[key] = doc.call.recording_url || null;
                          }
                        }
                      }
                    } catch (e) {
                      console.warn('Warning: Failed to fetch recording URLs from retell-call-data:', e?.message || e);
                    }
                  }
                  // console.log("recordingByBatchId",retellDocs);
        // Transform data to match the UI structure
        const transformedData = requestAssessments.map((assessment, index) => {
            // Format assessment ID
            const assessmentId = assessment._id;

            // Format scheduled time
            const assessmentDate = new Date(assessment.assessmentDate);
            const formattedTime = `${assessmentDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}, ${assessment.timeHour}:${assessment.timeMinute} ${assessment.timeAmPm}`;

            // Map status to UI status
            let currentStatus = 'Scheduled';
            if (assessment.status === 'completed') {
                currentStatus = 'Data Found';
            } else if (assessment.status === 'cancelled') {
                currentStatus = 'Data Missing';
            } else if (assessment.status === 'pending') {
                currentStatus = 'Waiting for Updates';
            }

            // Extract Awaz IDs from retellBatchCallData if available
            let awazCallId = 'N/A';

            if (assessment.retellBatchCallData && assessment.retellBatchCallData.batch_call_id) {
                awazCallId = assessment.retellBatchCallData.batch_call_id;
            }

            // Generate logs based on assessment data
            const logs = generateAssessmentLogs(assessment, currentStatus);

            const recording_url = typeof awazCallId === 'string' && awazCallId !== 'N/A'
                ? (recordingByBatchId[awazCallId] || null)
                : null;
            return {
                assessmentId,
                patientName: assessment.patientName,
                patientId: assessment.patientId,
                assignedTest: assessment.assessmentType,
                scheduledTime: formattedTime,
                currentStatus,
                awazCallId,
                recording_url,
                report: 'View Report',
                logs
            };
        });

        res.json({
            success: true,
            data: transformedData,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching assessment results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessment results',
            error: error.message
        });
    }
};

// Helper function to generate assessment logs
const generateAssessmentLogs = (assessment, currentStatus) => {
    const logs = [];
    const createdAt = new Date(assessment.createdAt);
    const assessmentDate = new Date(assessment.assessmentDate);

    // Initial scheduling log
    logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Scheduled: Call scheduled with Retell.AI (ID: ${assessment._id}) for ${assessmentDate.toISOString()}`);

    // Status-specific logs
    if (currentStatus === 'Data Found') {
        logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Call completed: Assessment completed successfully`);
        logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Status changed from scheduled to data_found`);
        logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Final Report Generated: Report available for viewing`);
    } else if (currentStatus === 'Data Missing') {
        logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Call failed: Assessment could not be completed`);
        logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Status changed from scheduled to data_missing`);
    } else if (currentStatus === 'Waiting for Updates') {
        logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Call in progress: Waiting for assessment data`);
        logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] Status changed from scheduled to waiting_for_updates`);
    }

    // Add system cleanup log
    logs.push(`[${createdAt.toISOString().replace('T', ' ').slice(0, 19)}] System Cleanup: Temporary files removed`);

    return logs.join(' | ');
};

// Get assessment questions by call_id from patient_assessments_retell collection
export const getAssessmentQuestions = async(req, res) => {
    try {
        const { callId } = req.params;

        if (!callId) {
            return res.status(400).json({
                success: false,
                message: 'Call ID is required'
            });
        }

        // Access patient_assessments_retell collection
        const db = mongoose.connection?.db;
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const patientAssessmentsColl = db.collection('patient_assessments_retell');
        
        // Find assessment data by call_id
        const assessmentData = await patientAssessmentsColl.findOne({ call_id: callId });

        if (!assessmentData) {
            return res.status(404).json({
                success: false,
                message: 'Assessment questions not found for this call ID'
            });
        }

        // Extract questionResponses array
        const questionResponses = assessmentData.questionResponses || [];
        
        // Extract postcallAnalysis array
        const postcallAnalysis = assessmentData.postcallAnalysis || [];

        // Fetch conversation transcript from retell-call-data collection
        const retellCallDataColl = db.collection('retell-call-data');
        const retellCallData = await retellCallDataColl.findOne({ 
            'call.call_id': callId 
        });

        // Extract transcript_object if available
        let conversationTranscript = [];
        if (retellCallData && retellCallData.call && retellCallData.call.transcript_object) {
            conversationTranscript = retellCallData.call.transcript_object.map((item) => ({
                role: item.role === 'agent' ? 'AGENT' : 'PATIENT',
                text: item.content || ''
            }));
        }

        res.json({
            success: true,
            data: {
                callId: assessmentData.call_id,
                transcription: assessmentData.transcription || '',
                questionResponses: questionResponses.map((q, index) => ({
                    number: `Q${index + 1}`,
                    code: q.questionCode || `question_${index + 1}`,
                    score: q.score !== undefined ? q.score : 'No score',
                    questionText: q.questionString || 'No question text',
                    response: q.response || 'No response recorded',
                    interpretation: q.interpretation || 'No interpretation recorded',
                })),
                totalQuestions: questionResponses.length,
                answered: questionResponses.filter(q => q.response).length,
                notRecorded: questionResponses.filter(q => !q.response).length,
                postcallAnalysis: postcallAnalysis.map((item, index) => ({
                    questionText: item.code || `ANALYSIS ${index + 1}`,
                    response: Array.isArray(item.value) ? item.value.join(', ') : String(item.value || '')
                })),
                conversationTranscript: conversationTranscript
            }
        });

    } catch (error) {
        console.error('Error fetching assessment questions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessment questions',
            error: error.message
        });
    }
};