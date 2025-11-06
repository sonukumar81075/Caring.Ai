import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { encrypt } from '../utils/fieldEncryption.js';
import { sendEmail } from '../utils/sendEmail.js';
import { createDoctorCredentialsEmailTemplate } from '../utils/emailTemplates.js';
import { generateUsernameFromEmail, generateSecurePassword } from '../utils/doctorCredentials.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';

// CREATE - Add new doctor with HIPAA compliance and auto-create user account
export const createDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialty } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !email || !phone || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and specialty are required fields'
      });
    }

    // Check if doctor with email already exists
    const existingDoctor = await Doctor.findOne({ email: encrypt(email) });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: 'A doctor with this email address already exists'
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    // Generate credentials for the doctor
    const username = generateUsernameFromEmail(email);
    const password = generateSecurePassword(16);
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    let newDoctor = null;
    let newUser = null;

    try {
      // Create new doctor first
      const doctorData = {
        name,
        email,
        phone,
        specialty,
        createdBy: userId
      };

      newDoctor = new Doctor(doctorData);
      await newDoctor.save();

      // Create new user account for the doctor
      const userData = {
        username,
        name,
        email,
        password: hashedPassword,
        role: 'Doctor',
        physicianId: newDoctor.doctorId, // Link to the doctor's ID
        isVerified: false,
        verificationToken,
        organization: req.user.organization // Link to the same organization as the creator
      };

      newUser = new User(userData);
      await newUser.save();

      // Send credentials email to the doctor
      const verifyUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
      try {
        await sendEmail(
          email,
          "Your Caring AI Doctor Account - Login Credentials",
          createDoctorCredentialsEmailTemplate(name, username, password, verifyUrl)
        );
      } catch (emailError) {
        console.error('Error sending doctor credentials email:', emailError);
        // Don't fail the entire operation if email fails
      }

      // Log doctor creation for audit
      console.log(`Doctor created: ${newDoctor.doctorId} with user account: ${newUser._id} by user: ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Doctor created successfully with user account. Login credentials have been sent to the doctor\'s email.',
        data: {
          doctor: newDoctor,
          userCreated: true,
          emailSent: true
        }
      });

    } catch (createError) {
      // Cleanup: If user creation failed but doctor was created, remove the doctor
      if (newDoctor && !newUser) {
        try {
          await Doctor.findByIdAndDelete(newDoctor._id);
          console.log(`Cleaned up doctor record ${newDoctor._id} due to user creation failure`);
        } catch (cleanupError) {
          console.error('Error cleaning up doctor record:', cleanupError);
        }
      }
      // If doctor creation failed but user was created, remove the user
      else if (newUser && !newDoctor) {
        try {
          await User.findByIdAndDelete(newUser._id);
          console.log(`Cleaned up user record ${newUser._id} due to doctor creation failure`);
        } catch (cleanupError) {
          console.error('Error cleaning up user record:', cleanupError);
        }
      }
      
      throw createError;
    }

  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// READ - Get all doctors with pagination and filtering
export const getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Filter by createdBy (show only self-created doctors)
    query.createdBy = req.user.id;
    
    // Filter by status (default to active only)
    const status = req.query.status || 'Active';
    console.log('DEBUG: Status filter:', status);
    
    if (status !== 'All') {
      query.status = status;
    }
    
    let doctors, total;
    
    // If there's a search term, fetch all doctors and filter in application layer for true global search
    if (search && typeof search === 'string' && search.trim().length > 0) {
      console.log('DEBUG: Applying global search filter for:', search);
      const searchTerm = search.trim().toLowerCase();
      
      // Get all doctors for the user first (without search filter in DB query)
      // This is necessary because encrypted fields can't be searched directly in MongoDB
      const allDoctors = await Doctor.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email');
      
      // Filter doctors after decryption (toJSON with getters: true will decrypt)
      const filteredDoctors = allDoctors.filter(doctor => {
        const doctorObj = doctor.toJSON(); // This will decrypt the fields
        const searchLower = searchTerm.toLowerCase();
        
        // Search across all fields with case-insensitive matching
        return (
          (doctorObj.doctorId && doctorObj.doctorId.toLowerCase().includes(searchLower)) ||
          (doctorObj.name && doctorObj.name.toLowerCase().includes(searchLower)) ||
          (doctorObj.email && doctorObj.email.toLowerCase().includes(searchLower)) ||
          (doctorObj.phone && doctorObj.phone.includes(searchTerm)) ||
          (doctorObj.specialty && doctorObj.specialty.toLowerCase().includes(searchLower))
        );
      });
      
      // Apply pagination to filtered results
      total = filteredDoctors.length;
      doctors = filteredDoctors.slice(skip, skip + limit);
      
    } else {
      console.log('DEBUG: No search term, fetching all doctors with status filter');
      
      // Get doctors with pagination
      doctors = await Doctor.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');

      total = await Doctor.countDocuments(query);
    }

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDoctors: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// READ - Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    const doctor = await Doctor.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    })
      .select('-__v')
      .populate('createdBy', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// UPDATE - Update doctor information
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialty } = req.body;
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    // Check if doctor exists and belongs to current user
    const doctor = await Doctor.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check for email uniqueness if email is being updated
    if (email && email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({ 
        email: encrypt(email),
        _id: { $ne: id }
      });
      if (existingDoctor) {
        return res.status(409).json({
          success: false,
          message: 'Another doctor with this email address already exists'
        });
      }

      // Also check if a user with this email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists'
        });
      }
    }

    // Update doctor data - allow the required fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (specialty !== undefined) updateData.specialty = specialty;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    // Log update for audit
    console.log(`Doctor updated: ${updatedDoctor.doctorId} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor
    });

  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// DELETE - Deactivate doctor (HIPAA compliant)
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    // Check if doctor exists and belongs to current user
    const doctor = await Doctor.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if already deactivated
    if (doctor.status === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: 'Doctor is already deactivated'
      });
    }

    // Deactivate the doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      {
        status: 'Inactive',
        deactivatedAt: new Date(),
        deactivatedBy: userId
      },
      { new: true }
    );

    // Log deactivation for audit
    console.log(`Doctor deactivated: ${updatedDoctor.doctorId} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Doctor deactivated successfully',
      data: updatedDoctor
    });

  } catch (error) {
    console.error('Error deactivating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// REACTIVATE - Reactivate doctor
export const reactivateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    // Check if doctor exists and belongs to current user
    const doctor = await Doctor.findOne({ 
      _id: id, 
      createdBy: req.user.id 
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if already active
    if (doctor.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Doctor is already active'
      });
    }

    // Reactivate the doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      {
        status: 'Active',
        deactivatedAt: null,
        deactivatedBy: null
      },
      { new: true }
    );

    // Log reactivation for audit
    console.log(`Doctor reactivated: ${updatedDoctor.doctorId} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Doctor reactivated successfully',
      data: updatedDoctor
    });

  } catch (error) {
    console.error('Error reactivating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// EXPORT - Export doctors data
export const exportDoctors = async (req, res) => {
  try {
    const { format, search, status } = req.query;
    
    // Build query - Get all doctors for export
    let query = {};
    
    // Filter by createdBy (show only self-created doctors)
    query.createdBy = req.user.id;

    // Get all matching doctors
    const doctors = await Doctor.find(query)
      .select('-__v -createdAt -updatedAt')
      .sort({ createdAt: -1 });

    // If no format specified, default to csv
    const exportFormat = format || 'csv';
    
    if (exportFormat === 'csv') {
      // Generate CSV
      const csvHeader = 'Doctor ID,Name,Email,Phone,Specialty,Status\n';
      const csvData = doctors.map(doctor => {
        return `"${doctor.doctorId}","${doctor.name}","${doctor.email}","${doctor.phone}","${doctor.specialty}","${doctor.status}"`;
      }).join('\n');
      
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="doctors_export.csv"');
      res.send(csv);
    } else if (exportFormat === 'json') {
      // Transform doctors data to clean JSON format
      const cleanDoctors = doctors.map(doctor => ({
        doctorId: doctor.doctorId,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty,
        status: doctor.status
      }));
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="doctors_export.json"');
      res.json(cleanDoctors);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Supported formats: csv, json'
      });
    }

  } catch (error) {
    console.error('Error exporting doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// GET - Get doctor statistics
export const getDoctorStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const specialties = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialty',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        specialties
      }
    });

  } catch (error) {
    console.error('Error fetching doctor statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
