// Import real API services
import { patientService } from './services/patientService.js';
import { doctorService } from './services/doctorService.js';

// Dynamic API functions - only use real API, no mock data fallback
export const apiFetchPatients = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = 'Active' } = params;
  
  const response = await patientService.getPatients({
    page,
    limit,
    search,
    status
  });
  return {
    data: response.data || [],
    pagination: response.pagination || {}
  };
};

export const apiCreatePatient = async (newPatient) => {
  const response = await patientService.createPatient(newPatient);
  return response.data;
};

export const apiUpdatePatient = async (patientId, updatedPatient) => {
  const response = await patientService.updatePatient(patientId, updatedPatient);
  return response.data;
};

// Doctor API functions
export const apiFetchDoctors = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = 'Active' } = params;
  
  const response = await doctorService.getDoctors({
    page,
    limit,
    search,
    status
  });
  return {
    data: response.data || [],
    pagination: response.pagination || {}
  };
};

export const apiCreateDoctor = async (newDoctor) => {
  const response = await doctorService.createDoctor(newDoctor);
  return response.data;
};

export const apiUpdateDoctor = async (doctorId, updatedDoctor) => {
  const response = await doctorService.updateDoctor(doctorId, updatedDoctor);
  return response.data;
};

export const apiDeleteDoctor = async (doctorId) => {
  const response = await doctorService.deleteDoctor(doctorId);
  return response.data;
};

export const apiDeletePatient = async (patientId) => {
  const response = await patientService.deletePatient(patientId);
  return response.data;
};

// Export functions
export const apiExportPatients = async (params = {}) => {
  const { format = 'csv', search = '', status = 'Active' } = params;
  
  const response = await patientService.exportPatients({ format, search, status });
  return response;
};

export const apiExportDoctors = async (params = {}) => {
  const { format = 'csv', search = '', status = 'Active' } = params;
  
  const response = await doctorService.exportDoctors({ format, search, status });
  return response;
};

// Reactivation functions
export const apiReactivatePatient = async (patientId) => {
  const response = await patientService.reactivatePatient(patientId);
  return response.data;
};

export const apiReactivateDoctor = async (doctorId) => {
  const response = await doctorService.reactivateDoctor(doctorId);
  return response.data;
};