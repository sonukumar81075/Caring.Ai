// PatientInformation.jsx
import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  Lock,
  Search,
  ArrowRight,
  X,
  Check,
  Plus,
  UserPlus,
} from "lucide-react";
import { patientService } from "../../services/patientService";
import ethnicityService from "../../services/ethnicityService";
import genderService from "../../services/genderService";
import { useNavigate } from "react-router-dom";

const PatientInformation = ({ initialValues, validationSchema, onSubmit }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(
    initialValues.searchPatient || ""
  );
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectingPatient, setSelectingPatient] = useState(false);
  const [ethnicities, setEthnicities] = useState([]);
  const [loadingEthnicities, setLoadingEthnicities] = useState(false);
  const [genders, setGenders] = useState([]);
  const [loadingGenders, setLoadingGenders] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Load ethnicities and genders on component mount
  useEffect(() => {
    loadEthnicities();
    loadGenders();
  }, []);

  // Debug ethnicities state changes
  useEffect(() => {}, [ethnicities]);

  // Debug genders state changes
  useEffect(() => {}, [genders]);

  // Load ethnicities from database
  const loadEthnicities = async () => {
    try {
      setLoadingEthnicities(true);
      const response = await ethnicityService.getAllEthnicities({
        status: "active",
      });

      // The API returns { ethnicities: [...], pagination: {...} } directly
      if (response.ethnicities && Array.isArray(response.ethnicities)) {
        setEthnicities(response.ethnicities);
      } else {
        setEthnicities([]);
      }
    } catch (error) {
      console.error("Error loading ethnicities:", error);
      setEthnicities([]);
    } finally {
      setLoadingEthnicities(false);
    }
  };

  // Load genders from database
  const loadGenders = async () => {
    try {
      setLoadingGenders(true);
      const response = await genderService.getAllGenders({ status: "active" });

      // The API returns { genders: [...], pagination: {...} } directly
      if (response.genders && Array.isArray(response.genders)) {
        setGenders(response.genders);
      } else {
        setGenders([]);
      }
    } catch (error) {
      console.error("Error loading genders:", error);
      setGenders([]);
    } finally {
      setLoadingGenders(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search query is empty, clear results
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchPatients(value.trim());
    }, 300); // 300ms debounce
  };

  // Search patients function
  const searchPatients = async (query) => {
    try {
      setIsSearching(true);
      const response = await patientService.searchPatients(query, 10);
      if (response.success) {
        setSearchResults(response.data || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient, setFieldValue) => {
    // Set selecting state
    setSelectingPatient(true);

    // Set selected patient first
    setSelectedPatient(patient);
    setSearchQuery(`${patient.name} (${patient.patientId})`);

    // Auto-fill patient fields
    if (setFieldValue) {
      // Use setTimeout to ensure the state update is processed
      setTimeout(() => {
        setFieldValue("patientName", patient?.name);
        setFieldValue("patientId", patient?.patientId);
        setFieldValue("phoneNumber", patient?.contactNo || "");
        setFieldValue("age", patient?.age || "");

        // Clear selecting state
        setSelectingPatient(false);
      }, 100);
    } else {
      setSelectingPatient(false);
    }

    // Close search results after a short delay
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);

    // Note: gender and ethnicity are not available in the patient model
    // They will need to be filled manually or added to the patient model
  };

  // Clear search
  const clearSearch = (setFieldValue) => {
    setSelectedPatient(null);
    setSelectingPatient(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);

    // Clear patient fields
    setFieldValue("patientName", "");
    setFieldValue("patientId", "");
    setFieldValue("phoneNumber", "");
    setFieldValue("age", "");
    setFieldValue("gender", "");
    setFieldValue("ethnicity", "");
  };

  // Handle add patient redirect
  const handleAddPatient = () => {
    navigate("/patients");
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on search results or input
      if (
        searchResultsRef.current &&
        searchResultsRef.current.contains(event.target)
      ) {
        return; // Don't close if clicking inside search results
      }
      if (
        searchInputRef.current &&
        searchInputRef.current.contains(event.target)
      ) {
        return; // Don't close if clicking on input
      }

      // Close search results if clicking outside
      setShowSearchResults(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initialStepValues = {
    patientName: initialValues?.patientName,
    patientId: initialValues?.patientId,
    phoneNumber: initialValues?.phoneNumber,
    age: initialValues?.age,
    gender: initialValues?.gender,
    ethnicity: initialValues?.ethnicity,
    hasCaregiver: initialValues?.hasCaregiver,
  };

  const handleSubmitWrapper = (values, formikHelpers) => {
    const fullStepValues = {
      ...values,
      searchPatient: searchQuery,
    };
    onSubmit(fullStepValues, formikHelpers);
  };

  return (
    <Formik
      initialValues={initialStepValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmitWrapper}
      enableReinitialize={true}
    >
      {({ isSubmitting, setFieldValue }) => {
        return (
          <Form>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Patient Information
              </h3>
              <p className="text-gray-500 mb-6">
                Please fill in all required patient details.
              </p>
              <label
                htmlFor="searchPatient"
                className="block text-sm font-medium text-gray-700"
              >
                Search Patient <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  id="searchPatient"
                  name="searchPatient"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e, setFieldValue)}
                  placeholder="Search for patient by name, ID, email, or phone..."
                  className={`block w-full border border-gray-300 rounded-lg p-3 ${
                    selectedPatient || selectingPatient ? "pl-12" : "pl-10"
                  } pr-20 focus:outline-1 outline-gray-400 placeholder-gray-500`}
                  autoComplete="off"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />

                {/* Selected patient indicator */}
                {/* {selectingPatient ? (
                <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedPatient ? (
                <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : null} */}

                {/* Right side buttons */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {/* Add Patient button */}
                  <button
                    type="button"
                    onClick={handleAddPatient}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
                    title="Add New Patient"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>

                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => clearSearch(setFieldValue)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                      title="Clear Search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div
                    ref={searchResultsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="p-3 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : searchResults?.length > 0 ? (
                      searchResults?.map((patient) => (
                        <button
                          key={patient?._id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePatientSelect(patient, setFieldValue);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                            selectedPatient &&
                            selectedPatient?._id === patient?._id
                              ? "bg-green-50 border-green-200"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-2">
                              {selectedPatient &&
                                selectedPatient?._id === patient?._id && (
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {patient?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ID: {patient?.patientId}
                                </p>
                                {patient?.contactNo && (
                                  <p className="text-sm text-gray-500">
                                    Phone: {patient?.contactNo}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {patient?.age && (
                                <p className="text-sm text-gray-500">
                                  Age: {patient?.age}
                                </p>
                              )}
                              {patient?.email && (
                                <p className="text-sm text-gray-500">
                                  {patient?.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : searchQuery.trim() && !isSearching ? (
                      <div className="p-3 text-center">
                        <p className="text-sm text-gray-500 mb-3">
                          No patients found
                        </p>
                        <button
                          type="button"
                          onClick={handleAddPatient}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-color text-white text-sm rounded-lg bg-hover transition-colors cursor-pointer"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add New Patient
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Search by patient name, ID, email, or phone number to auto-fill
                the form fields below
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="patientName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Patient Name <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    (Auto-filled from search)
                  </span>
                </label>
                <Field
                  type="text"
                  id="patientName"
                  name="patientName"
                  placeholder="Patient name"
                  disabled={true}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 bg-gray-100 cursor-not-allowed"
                />
                <ErrorMessage
                  name="patientName"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="patientId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Patient ID <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    (Auto-filled from search)
                  </span>
                </label>
                <div className="relative mt-1">
                  <Field
                    type="text"
                    id="patientId"
                    name="patientId"
                    placeholder="Patient ID"
                    disabled={true}
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <ErrorMessage
                  name="patientId"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    (Auto-filled from search)
                  </span>
                </label>
                <Field
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Phone number"
                  disabled={true}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 bg-gray-100 cursor-not-allowed"
                />
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700"
                >
                  Age <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    (Auto-filled from search)
                  </span>
                </label>
                <Field
                  type="number"
                  id="age"
                  name="age"
                  placeholder="Age"
                  disabled={true}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 bg-gray-100 cursor-not-allowed"
                />
                <ErrorMessage
                  name="age"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender (Optional)
                </label>
                <div className="relative">
                  <Field
                    as="select"
                    id="gender"
                    name="gender"
                    className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black"
                    disabled={loadingGenders}
                  >
                    <option value="" disabled className="text-gray-500">
                      {loadingGenders ? "Loading genders..." : "Select gender"}
                    </option>
                    {genders?.length > 0 ? (
                      genders?.map((gender) => (
                        <option
                          key={gender?._id}
                          className="text-black"
                          value={gender?.name}
                        >
                          {gender?.name}
                        </option>
                      ))
                    ) : (
                      <option disabled className="text-gray-500">
                        No genders available
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
              </div>

              <div>
                <label
                  htmlFor="ethnicity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ethnicity (Optional)
                </label>
                <div className="relative">
                  <Field
                    as="select"
                    id="ethnicity"
                    name="ethnicity"
                    className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black"
                    disabled={loadingEthnicities}
                  >
                    <option value="" disabled className="text-gray-500">
                      {loadingEthnicities
                        ? "Loading ethnicities..."
                        : "Select ethnicity"}
                    </option>
                    {ethnicities?.length > 0 ? (
                      ethnicities?.map((ethnicity) => (
                        <option
                          key={ethnicity?._id}
                          className="text-black"
                          value={ethnicity?.name}
                        >
                          {ethnicity?.name}
                        </option>
                      ))
                    ) : (
                      <option disabled className="text-gray-500">
                        No ethnicities available
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
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Does the patient have a caregiver present?
              </label>
              <div
                role="group"
                aria-labelledby="caregiver-radio-group"
                className="flex flex-col space-y-2"
              >
                <label className="inline-flex items-center">
                  <Field
                    type="radio"
                    name="hasCaregiver"
                    value="Yes"
                    className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <Field
                    type="radio"
                    name="hasCaregiver"
                    value="No"
                    className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
              </div>
              <ErrorMessage
                name="hasCaregiver"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="sm:flex grid grid-cols-1 text-center items-center justify-end mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:px-6 px-3 py-2.5 bg-color bg-hover text-white rounded-lg transition-colors duration-200 cursor-pointer font-medium flex items-center justify-center sm:justify-start"
              >
                <div className="flex items-center justify-center sm:hidden">
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>

                <div className="hidden sm:flex items-center">
                  <span>Continue to Assessment Details</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default PatientInformation;
