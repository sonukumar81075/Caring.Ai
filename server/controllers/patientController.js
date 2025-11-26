import Patient from '../models/Patient.js';
import { encrypt } from '../utils/fieldEncryption.js';
import mongoose from 'mongoose';

// CREATE - Add new patient with HIPAA compliance
export const createPatient = async (req, res) => {
  try {
    const { name, email, contactNo, age, dateOfBirth } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !email || !contactNo || !age || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, contact number, age, and date of birth are required fields'
      });
    }

    // Check if patient with email already exists
    const existingPatient = await Patient.findOne({ email: encrypt(email) });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'A patient with this email address already exists'
      });
    }

    // Create new patient with the required fields including dateOfBirth
    const patientData = {
      name,
      email,
      contactNo,
      age,
      dateOfBirth,
      createdBy: userId
    };

    const newPatient = new Patient(patientData);
    await newPatient.save();

    // Log patient creation for audit
    console.log(`Patient created: ${newPatient.patientId} by user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: {
        id: newPatient._id,
        patientId: newPatient.patientId,
        name: newPatient.name,
        email: newPatient.email,
        contactNo: newPatient.contactNo,
        age: newPatient.age,
        status: newPatient.status,
        createdAt: newPatient.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// READ - Get all patients with pagination and filtering
export const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    console.log('getPatients called with params:', {
      page, limit, search, status: req.query.status
    });

    // Build query
    let query = {};
    
    // Filter by createdBy (show only self-created patients)
    query.createdBy = req.user.id;
    
    // Filter by status (default to active only)
    const status = req.query.status || 'Active';
    console.log('DEBUG: Status filter:', status);
    
    if (status !== 'All') {
      query.status = status;
    }
    
    // Only apply search if there's actually a search term
    if (search && typeof search === 'string' && search.trim().length > 0) {
      console.log('DEBUG: Applying global search filter for:', search);
      const searchTerm = search.trim().toLowerCase();
      
      // For global search with encrypted fields, we'll fetch all patients first
      // then filter them in the application layer for true global search
      
      // First, try database-level search for non-encrypted fields
      const dbSearchConditions = [
        // Search by patient ID (partial match)
        { patientId: { $regex: searchTerm, $options: 'i' } }
      ];
      
      // Add age search if the term is numeric
      if (!isNaN(searchTerm)) {
        dbSearchConditions.push({ age: parseInt(searchTerm) });
      }
      
      // Add exact encrypted matches for common patterns
      dbSearchConditions.push(
        { name: encrypt(searchTerm) },
        { email: encrypt(searchTerm) },
        { contactNo: encrypt(searchTerm) }
      );
      
      // Add word-by-word search for patient ID
      const searchWords = searchTerm.split(' ').filter(word => word.length >= 2);
      searchWords.forEach(word => {
        dbSearchConditions.push({ patientId: { $regex: word, $options: 'i' } });
      });
      
      query.$or = dbSearchConditions;
    } else {
      console.log('DEBUG: No search term, fetching all patients with status filter');
    }

    // DEBUG: First check total count in database
    const totalCount = await Patient.countDocuments();
    console.log('DEBUG: Total patients in database:', totalCount);
    
    let patients, total;
    
    // If there's a search term, fetch all patients and filter in application layer for true global search
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = search.trim().toLowerCase();
      
      // Fetch ALL patients with status filter and createdBy filter (no search in DB query)
      const statusQuery = {
        createdBy: req.user.id // Always include createdBy filter
      };
      if (status !== 'All') {
        statusQuery.status = status;
      }
      
      const allPatients = await Patient.find(statusQuery)
        .select('-__v')
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email');
      
      // Filter patients in application layer for true global search
      const filteredPatients = allPatients.filter(patient => {
        const patientObj = patient.toJSON(); // This will decrypt the fields
        const searchLower = searchTerm.toLowerCase();
        
        return (
          patientObj.patientId.toLowerCase().includes(searchLower) ||
          patientObj.name.toLowerCase().includes(searchLower) ||
          (patientObj.email && patientObj.email.toLowerCase().includes(searchLower)) ||
          (patientObj.contactNo && patientObj.contactNo.includes(searchTerm)) ||
          patientObj.age.toString().includes(searchTerm)
        );
      });
      
      // Apply pagination to filtered results
      total = filteredPatients.length;
      patients = filteredPatients.slice(skip, skip + limit);
      
      console.log('DEBUG: Global search - Found', filteredPatients.length, 'patients matching search term');
    } else {
      // Normal database query without search
      patients = await Patient.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');

      total = await Patient.countDocuments(query);
      
      console.log('DEBUG: Query used:', JSON.stringify(query, null, 2));
      console.log('DEBUG: Found patients:', patients.length, 'out of total:', total);
    }
    
    // DEBUG: Log first patient if exists
    if (patients.length > 0) {
      console.log('DEBUG: First patient sample:', JSON.stringify(patients[0], null, 2));
    }

    res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPatients: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// READ - Get single patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    const patient = await Patient.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    })
      .select('-__v')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Log access for HIPAA compliance
    await patient.logAccess(req.user.id);

    res.status(200).json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// UPDATE - Update patient information
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contactNo, age, dateOfBirth } = req.body;
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    // Check if patient exists and belongs to current user
    const patient = await Patient.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check for email uniqueness if email is being updated
    if (email && email !== patient.email) {
      const existingPatient = await Patient.findOne({ 
        email: encrypt(email),
        _id: { $ne: id }
      });
      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: 'Another patient with this email address already exists'
        });
      }
    }

    // Update patient data - allow the required fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (contactNo !== undefined) updateData.contactNo = contactNo;
    if (age !== undefined) updateData.age = age;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    // Log update for audit
    console.log(`Patient updated: ${updatedPatient.patientId} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient
    });

  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// DELETE - Soft delete patient (mark as inactive for HIPAA compliance)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    // Check if patient exists and belongs to current user
    const patient = await Patient.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if already deactivated
    if (patient.status === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: 'Patient is already deactivated'
      });
    }

    // Soft delete - mark as inactive instead of hard delete for HIPAA compliance
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { 
        status: 'Inactive',
        deactivatedAt: new Date(),
        deactivatedBy: userId
      },
      { new: true }
    );

    // Log deletion for audit
    console.log(`Patient deactivated: ${updatedPatient.patientId} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Patient deactivated successfully',
      data: {
        id: updatedPatient._id,
        patientId: updatedPatient.patientId,
        status: updatedPatient.status
      }
    });

  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// REACTIVATE - Reactivate patient
export const reactivatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    // Check if patient exists and belongs to current user
    const patient = await Patient.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if already active
    if (patient.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Patient is already active'
      });
    }

    // Reactivate the patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      {
        status: 'Active',
        deactivatedAt: null,
        deactivatedBy: null
      },
      { new: true }
    );

    // Log reactivation for audit
    console.log(`Patient reactivated: ${updatedPatient.patientId} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Patient reactivated successfully',
      data: updatedPatient
    });

  } catch (error) {
    console.error('Error reactivating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// EXPORT - Export patients data
export const exportPatients = async (req, res) => {
  try {
    const { format = 'csv', search, status } = req.query;
    
    // Build query - Get all patients for export
    let query = {};
    
    // Filter by createdBy (show only self-created patients)
    query.createdBy = req.user.id;
    
    // Get all matching patients
    const patients = await Patient.find(query)
      .select('-__v -createdAt -updatedAt')
      .sort({ createdAt: -1 });


    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Patient ID,Name,Email,Contact No,Age,Date of Birth,Status\n';
      const csvData = patients.map(patient => {
        const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '';
        return `"${patient.patientId}","${patient.name}","${patient.email}","${patient.contactNo}","${patient.age}","${dob}","${patient.status}"`;
      }).join('\n');
      
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="patients_export.csv"');
      res.send(csv);
    } else if (format === 'json') {
      // Transform patients data to clean JSON format
      const cleanPatients = patients.map(patient => ({
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        contactNo: patient.contactNo,
        age: patient.age,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        status: patient.status
      }));
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="patients_export.json"');
      res.json(cleanPatients);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Supported formats: csv, json'
      });
    }

  } catch (error) {
    console.error('Error exporting patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export patients',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// GET - Get patient statistics
export const getPatientStatistics = async (req, res) => {
  try {
    const stats = await Patient.getStatistics();
    
    const totalPatients = await Patient.countDocuments();
    const activePatients = await Patient.countDocuments({ status: 'Active' });
    const inactivePatients = await Patient.countDocuments({ status: 'Inactive' });

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        activePatients,
        inactivePatients,
        statusBreakdown: stats
      }
    });

  } catch (error) {
    console.error('Error fetching patient statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// POST - Search patients
export const searchPatients = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const limit = parseInt(req.query.limit) || 20;

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters long'
      });
    }

    // Since name and other fields are encrypted, we need to fetch all active patients
    // and then filter them after decryption
    const allPatients = await Patient.find({
      status: 'Active', // Only search active patients
      createdBy: req.user.id // Only search self-created patients
    })
      .select('name email contactNo age patientId status dateOfBirth')
      .limit(limit * 3); // Get more records to account for filtering

    // Filter patients after decryption (toJSON with getters: true will decrypt)
    const filteredPatients = allPatients.filter(patient => {
      const patientObj = patient.toJSON(); // This will decrypt the fields
      const searchLower = searchTerm.toLowerCase();
      
      return (
        patientObj.name.toLowerCase().includes(searchLower) ||
        patientObj.patientId.toLowerCase().includes(searchLower) ||
        (patientObj.email && patientObj.email.toLowerCase().includes(searchLower)) ||
        (patientObj.contactNo && patientObj.contactNo.includes(searchTerm))
      );
    }).slice(0, limit); // Limit the final results

    res.status(200).json({
      success: true,
      data: filteredPatients,
      count: filteredPatients.length
    });

  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
