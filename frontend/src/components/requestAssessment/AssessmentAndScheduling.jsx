// AssessmentAndScheduling.jsx - Combined Assessment and Scheduling Step
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import assessmentTypeService from "../../services/assessmentTypeService";
import { doctorService } from "../../services/doctorService";
import { Link, useNavigate } from "react-router-dom";

// Dummy Modal Component for Adding Doctors
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

// List of timezones
const timezones = [
  "Eastern Time (ET)",
  "Eastern Time - Toronto (ET)",
  "Central Time (CT)",
  "Mountain Time (MT)",
  "Pacific Time (PT)",
  "Pacific Time - Vancouver (PT)",
  "Arizona Time (MST)",
  "Alaska Time (AKT)",
  "Hawaii Time (HST)",
];

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
); // 01 to 12

const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
); // 00 to 59

const AssessmentAndScheduling = ({
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
  const navigate = useNavigate();
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
    assessmentDate: initialValues.assessmentDate || "",
    timezone: initialValues.timezone || "Eastern Time (ET)",
    timeHour: initialValues.timeHour || "09",
    timeMinute: initialValues.timeMinute || "00",
    timeAmPm: initialValues.timeAmPm || "AM",
  };

  return (
    <>
      <Formik
        initialValues={initialStepValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, setFieldValue, values, errors, touched }) => {
          const isDateSelected = !!values.assessmentDate;

          const selectedTimeDisplay =
            isDateSelected &&
            values.timeHour &&
            values.timeMinute &&
            values.timeAmPm &&
            values.timezone ? (
              <p className="text-gray-600 text-sm mt-3">
                Selected:{" "}
                <span className="font-semibold">
                  {values.timeHour}:{values.timeMinute} {values.timeAmPm} (
                  {values.timezone})
                </span>
              </p>
            ) : null;

          return (
            <Form>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Assessment & Scheduling
                </h3>
                <p className="text-gray-500 mb-6">
                  Select assessment details and schedule the call.
                </p>

                {/* Assessment Section */}
                <div className="bg-white rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    Assessment Details
                  </h4>

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
                        className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black bg-white"
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

                  {/* Assigning Physician */}
                  <div className="mb-6">
                    <label
                      htmlFor="assigningPhysician"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Assigning Physician{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="assigningPhysician"
                        name="assigningPhysician"
                        value={values.assigningPhysician}
                        onChange={(e) => {
                          if (e.target.value === "add-new-doctor") {
                            // setIsModalOpen(true);
                            navigate("/doctors");
                          } else {
                            setFieldValue("assigningPhysician", e.target.value);
                          }
                        }}
                        className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black bg-white"
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
                              {physician.specialty &&
                                `(${physician.specialty})`}
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
                          <Link>+ Add new doctor</Link>
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
                  <div className="mb-0">
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
                      className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black bg-white"
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
                </div>

                {/* Scheduling Section */}
                <div className="bg-white rounded-lg mb-6">
                  <div className="sm:flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-700">
                      Schedule Assessment
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        // Set time to current time (immediate call)
                        const now = new Date();

                        // Format date as YYYY-MM-DD
                        const year = now.getFullYear();
                        const month = String(
                          now.getMonth() + 1
                        ).padStart(2, "0");
                        const day = String(now.getDate()).padStart(
                          2,
                          "0"
                        );
                        const formattedDate = `${year}-${month}-${day}`;

                        // Get hours and minutes
                        let hours = now.getHours();
                        const minutes = String(
                          now.getMinutes()
                        ).padStart(2, "0");

                        // Convert to 12-hour format
                        const amPm = hours >= 12 ? "PM" : "AM";
                        hours = hours % 12 || 12; // Convert 0 to 12 for midnight
                        const formattedHour = String(hours).padStart(2, "0");

                        // Set all the fields
                        setFieldValue("assessmentDate", formattedDate);
                        setFieldValue("timeHour", formattedHour);
                        setFieldValue("timeMinute", minutes);
                        setFieldValue("timeAmPm", amPm);
                      }}
                      className="px-4 py-2.5 border sm:w-fit w-full sm:mt-0 mt-3 justify-center text-center border-gray-400  text-gray-500 text-sm rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:block hidden"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>

                      <span className="block sm:hidden">Schedule Now</span>
                      <span className="hidden sm:block">
                        Schedule Now
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assessment Date */}
                    <div>
                      <label
                        htmlFor="assessmentDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Assessment Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1">
                        <Field
                          type="date"
                          id="assessmentDate"
                          name="assessmentDate"
                          min={new Date().toISOString().split("T")[0]}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 bg-white"
                        />
                        <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                      <ErrorMessage
                        name="assessmentDate"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    {/* Timezone */}
                    <div className="relative">
                      <label
                        htmlFor="timezone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Assessment Time ( Timezone ){" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Field
                          as="select"
                          id="timezone"
                          name="timezone"
                          className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black bg-white"
                        >
                          {timezones.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
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
                        name="timezone"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    {/* Time Hour/Minute/AM/PM */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="timeHour"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Time <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-3 mt-1">
                        {/* Hour */}
                        <div className="w-1/3">
                          <label
                            htmlFor="timeHour"
                            className="text-xs text-gray-500 block mb-1"
                          >
                            Hour
                          </label>
                          <Field
                            as="select"
                            id="timeHour"
                            name="timeHour"
                            disabled={!isDateSelected}
                            className={`block border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 w-full placeholder-gray-500 text-black appearance-none bg-white ${
                              !isDateSelected
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {hours.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* Minute */}
                        <div className="w-1/3">
                          <label
                            htmlFor="timeMinute"
                            className="text-xs text-gray-500 block mb-1"
                          >
                            Minute
                          </label>
                          <Field
                            as="select"
                            id="timeMinute"
                            name="timeMinute"
                            disabled={!isDateSelected}
                            className={`block border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black w-full appearance-none bg-white ${
                              !isDateSelected
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {minutes.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* AM/PM */}
                        <div className="w-1/3">
                          <label
                            htmlFor="timeAmPm"
                            className="text-xs text-gray-500 block mb-1"
                          >
                            AM/PM
                          </label>
                          <Field
                            as="select"
                            id="timeAmPm"
                            name="timeAmPm"
                            disabled={!isDateSelected}
                            className={`block border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black w-full appearance-none bg-white ${
                              !isDateSelected
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </Field>
                        </div>
                      </div>

                      {/* Conditional Error Messages */}
                      {!isDateSelected && (
                        <div className="text-red-500 text-xs mt-1">
                          Please select an Assessment Date first.
                        </div>
                      )}
                      {/* Show time error only if date is selected */}
                      {errors.timeHour &&
                        touched.timeHour &&
                        isDateSelected && (
                          <div className="text-red-500 text-xs mt-1">
                            Please select a time.
                          </div>
                        )}

                      {selectedTimeDisplay}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="sm:flex grid grid-cols-2 gap-2 justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 text-gray-600 font-medium rounded-lg cursor-pointer border border-gray-300 transition duration-150 flex items-center text-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span className="block sm:hidden">Back</span>
                    <span className="hidden sm:block">
                      Back to Patient Info
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !isDateSelected ||
                      (isDateSelected && !values.timeHour)
                    }
                    className="px-6 py-2.5 bg-color bg-hover text-white rounded-lg transition-colors duration-200 cursor-pointer font-medium flex items-center  text-center justify-center disabled:opacity-50"
                  >
                    <span className="block sm:hidden">Continue</span>
                    <span className="hidden sm:block">Continue to Consent</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
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

export default AssessmentAndScheduling;
