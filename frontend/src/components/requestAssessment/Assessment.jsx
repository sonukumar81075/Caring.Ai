// Assessment.jsx
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ArrowLeft, ArrowRight } from "lucide-react";
import assessmentTypeService from "../../services/assessmentTypeService";
import { doctorService } from "../../services/doctorService";

// Dummy Modal Component
const AddDoctorModal = ({ isOpen, onClose, onSave }) => {
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleSave = () => {
    if (doctorName.trim()) {
      onSave({ name: doctorName.trim(), specialty: specialty.trim() || "N/A" });
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
          <label
            htmlFor="newDoctorName"
            className="block text-sm font-medium text-gray-700"
          >
            Doctor Name *
          </label>
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
          <label
            htmlFor="newDoctorSpecialty"
            className="block text-sm font-medium text-gray-700"
          >
            Specialty (Optional)
          </label>
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

const Assessment = ({
  initialValues,
  validationSchema,
  onSubmit,
  prevStep,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [physicians, setPhysicians] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [loadingAssessmentTypes, setLoadingAssessmentTypes] = useState(false);
  const [loadingPhysicians, setLoadingPhysicians] = useState(false);

  // Load assessment types and physicians on component mount
  useEffect(() => {
    loadAssessmentTypes();
    loadPhysicians();
  }, []);

  // Load assessment types from database
  const loadAssessmentTypes = async () => {
    try {
      setLoadingAssessmentTypes(true);
      const response = await assessmentTypeService.getAllAssessmentTypes({
        status: "active",
      });

      // The API returns { assessmentTypes: [...], pagination: {...} } directly
      if (response.assessmentTypes && Array.isArray(response.assessmentTypes)) {
        setAssessmentTypes(response.assessmentTypes);
      } else {
        setAssessmentTypes([]);
      }
    } catch (error) {
      console.error("Error loading assessment types:", error);
      setAssessmentTypes([]);
    } finally {
      setLoadingAssessmentTypes(false);
    }
  };

  // Load physicians from database
  const loadPhysicians = async () => {
    try {
      setLoadingPhysicians(true);
      const response = await doctorService.getDoctors({ status: "Active" }); 

      // The API returns { success: true, data: [...], pagination: {...} }
      if (response.success && response.data && Array.isArray(response.data)) { 
        setPhysicians(response.data);
      } else { 
        setPhysicians([]);
      }
    } catch (error) {
      console.error("Error loading physicians:", error);
      setPhysicians([]);
    } finally {
      setLoadingPhysicians(false);
    }
  };

  const handleAddDoctor = (newDoctor) => {
    const newId =
      newDoctor.name.toLowerCase().replace(/\s/g, "") +
      Math.random().toString(36).substring(7);
    setPhysicians((prev) => [...prev, { ...newDoctor, id: newId }]);
  };

  const initialStepValues = {
    assessmentType: initialValues.assessmentType,
    assigningPhysician: initialValues.assigningPhysician,
    communicationNotes: initialValues.communicationNotes,
  };

  return (
    <>
      <Formik
        initialValues={initialStepValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Assessment Details
              </h3>
              <p className="text-gray-500 mb-6">
                Select the assessment type and assigning physician.
              </p>

              {/* Assessment Type */}
              <div className="mb-6">
                <label
                  htmlFor="assessmentType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assessment Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Field
                    as="select"
                    id="assessmentType"
                    name="assessmentType"
                    className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black"
                    disabled={loadingAssessmentTypes}
                  >
                    <option value="" disabled className="text-gray-500">
                      {loadingAssessmentTypes
                        ? "Loading assessment types..."
                        : "Select assessment type"}
                    </option>
                    {assessmentTypes.length > 0 ? (
                      assessmentTypes.map((type) => (
                        <option
                          key={type._id}
                          className="text-black"
                          value={type.name}
                        >
                          {type.name}
                        </option>
                      ))
                    ) : (
                      <option disabled className="text-gray-500">
                        No assessment types available
                      </option>
                    )}
                  </Field>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <ErrorMessage
                  name="assessmentType"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Assigning Physician (with Modal Trigger) */}
              <div className="mb-6">
                <label
                  htmlFor="assigningPhysician"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assigning Physician <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="assigningPhysician"
                    name="assigningPhysician"
                    value={values.assigningPhysician}
                    onChange={(e) => {
                      if (e.target.value === "add-new-doctor") {
                        setIsModalOpen(true);
                      } else {
                        setFieldValue("assigningPhysician", e.target.value);
                      }
                    }}
                    className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black"
                    disabled={loadingPhysicians}
                  >
                    <option value="" disabled className="text-gray-500">
                      {loadingPhysicians
                        ? "Loading physicians..."
                        : "Select physician"}
                    </option>
                    {physicians.length > 0 ? (
                      physicians.map((physician) => (
                        <option
                          key={physician._id}
                          value={physician._id}
                          className="text-black"
                        >
                          {physician.name}{" "}
                          {physician.specialty && `(${physician.specialty})`}
                        </option>
                      ))
                    ) : (
                      <option disabled className="text-gray-500">
                        No physicians available
                      </option>
                    )}
                    <option
                      value="add-new-doctor"
                      className="font-bold text-gray-600 bg-gray-200 py-2"
                    >
                      + Add new doctor
                    </option>
                  </select>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <ErrorMessage
                  name="assigningPhysician"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Communication Notes */}
              <div className="mb-6">
                <label
                  htmlFor="communicationNotes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Communication Notes (Optional)
                </label>
                <Field
                  as="textarea"
                  id="communicationNotes"
                  name="communicationNotes"
                  rows="4"
                  placeholder="Any special communication notes for the patient..."
                  className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black"
                  maxLength={750}
                />
                <p className="text-gray-500 text-sm mt-1">
                  Maximum 150 words. These notes will help the AI agent
                  communicate effectively with the patient.
                </p>
                <ErrorMessage
                  name="communicationNotes"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="sm:flex grid grid-cols-2  gap-2 justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 text-gray-600 font-medium rounded-lg cursor-pointer border border-gray-300 transition duration-150 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />{" "}
                  <span className="block sm:hidden">Back</span>
                  <span className="hidden sm:block">Back to Patient Info</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-color bg-hover text-white rounded-lg transition-colors duration-200 cursor-pointer font-medium flex items-center"
                >
                  <span className="block sm:hidden">Continue</span>
                  <span className="hidden sm:block">
                    Continue to Scheduling
                  </span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddDoctor}
      />
    </>
  );
};

export default Assessment;
