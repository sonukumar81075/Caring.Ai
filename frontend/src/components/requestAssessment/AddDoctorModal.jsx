// Assessment.jsx
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ArrowLeft, ArrowRight } from "lucide-react"; // Assuming these are used for nav buttons

// Dummy Modal Component - Replace with your actual modal implementation
export const AddDoctorModal = ({ isOpen, onClose, onSave }) => {
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleSave = () => {
    if (doctorName.trim()) {
      onSave({ name: doctorName.trim(), specialty: specialty.trim() || 'N/A' });
      setDoctorName("");
      setSpecialty("");
      onClose();
    } else {
      alert("Doctor Name is required.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add New Doctor</h3>
        <div className="mb-4">
          <label htmlFor="newDoctorName" className="block text-sm font-medium text-gray-700">Doctor Name *</label>
          <input
            type="text"
            id="newDoctorName"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="newDoctorSpecialty" className="block text-sm font-medium text-gray-700">Specialty (Optional)</label>
          <input
            type="text"
            id="newDoctorSpecialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-color text-white rounded-md bg-hover transition"
          >
            Add Doctor
          </button>
        </div>
      </div>
    </div>
  );
};