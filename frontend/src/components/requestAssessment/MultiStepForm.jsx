// MultiStepForm.jsx
import React, { useState } from "react";
import { Check } from "lucide-react";
import * as Yup from "yup";
import { Alert, Snackbar, CircularProgress, Box } from "@mui/material";
import requestAssessmentService from "../../services/requestAssessmentService";

// Import all step components
import PatientInformation from "./PatientInformation";
import AssessmentAndScheduling from "./AssessmentAndScheduling";
import Consent from "./Consent";

// --- Initial State and Validation Schemas ---

const initialValues = {
  // --- Step 1: Patient Info ---
  patientName: "",
  patientId: "",
  phoneNumber: "",
  age: "",
  gender: "",
  ethnicity: "",
  hasCaregiver: "No",

  // --- Step 2: Assessment & Scheduling ---
  assessmentType: "",
  assigningPhysician: "",
  communicationNotes: "",
  assessmentDate: "",
  timezone: "Eastern Time (ET)",
  timeHour: "09",
  timeMinute: "00",
  timeAmPm: "AM",

  // --- Step 3: Consent ---
  consentAccepted: false,
};

// Define Validation Schemas for each step
const patientInfoSchema = Yup.object().shape({
  patientName: Yup.string().required("Patient Name is required"),
  patientId: Yup.string().required("Patient ID is required"),
  phoneNumber: Yup.string().required("Phone Number is required"),
  age: Yup.number()
    .typeError("Age must be a number")
    .required("Age is required")
    .min(1, "Age must be valid"),
  hasCaregiver: Yup.string().oneOf(["Yes", "No"]).required(),
});

const assessmentAndSchedulingSchema = Yup.object().shape({
  assessmentType: Yup.string().required("Assessment type is required"),
  assigningPhysician: Yup.string().required("Assigning physician is required"),
  communicationNotes: Yup.string().max(
    750,
    "Notes cannot exceed 750 characters."
  ),
  assessmentDate: Yup.string()
    .required("Assessment Date is required")
    .nullable(),
  timezone: Yup.string().required("Timezone is required"),
  timeHour: Yup.string().required("Hour is required"),
  timeMinute: Yup.string().required("Minute is required"),
  timeAmPm: Yup.string().required("AM/PM is required"),
});

const consentSchema = Yup.object().shape({
  consentAccepted: Yup.boolean().oneOf(
    [true],
    "Consent must be accepted to proceed and submit the form."
  ),
});

const validationSchemas = {
  1: patientInfoSchema,
  2: assessmentAndSchedulingSchema,
  3: consentSchema,
};

// --- MultiStepForm Component ---

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showMessage, setShowMessage] = useState(false);

  const steps = ["Patient Info", "Assessment & Scheduling", "Consent"];

  // Function to handle moving to the next step
  const nextStep = (values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep((prev) => Math.min(prev + 1, steps?.length));
  };

  const prevStep = () => {
    // Only decrement step, keeping form data for back navigation
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Final submission logic
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setShowMessage(false);

    try {
      setFormData((prev) => ({ ...prev, ...values }));
      const finalData = { ...formData, ...values };

      // Submit to the backend API
      const response = await requestAssessmentService.createRequestAssessment(
        finalData
      );

      if (response.success) {
        setMessage({
          type: "success",
          text: "Assessment request submitted successfully! Your request has been added to the booking queue.",
        });
        setShowMessage(true);

        // Reset form after successful submission
        setTimeout(() => {
          setFormData(initialValues);
          setStep(1);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text:
            response.message ||
            "Failed to submit assessment request. Please try again.",
        });
        setShowMessage(true);
      }
    } catch (error) {
      console.error("Error submitting assessment request:", error);
      
      // Extract error message from different possible error structures
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: "error",
        text: errorMessage,
      });
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = () => {
    const commonProps = {
      initialValues: formData,
      validationSchema: validationSchemas[step],
      onSubmit: step === steps?.length ? handleSubmit : nextStep,
      prevStep: prevStep,
      step: step,
    };

    switch (step) {
      case 1:
        return <PatientInformation {...commonProps} />;
      case 2:
        return <AssessmentAndScheduling {...commonProps} />;
      case 3:
        return <Consent {...commonProps} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-md sm:p-8 p-4 relative">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        Patient Assessment Request Form
      </h2>
      <p className="text-gray-500 mb-8">
        Complete each section step by step. Fields marked with{" "}
        <span className="text-red-500 font-normal">*</span> are required.
      </p>

      {/* Success/Error Messages */}
      {showMessage && (
        <Box sx={{ mb: 3 }}>
          <Alert
            severity={message.type}
            onClose={() => setShowMessage(false)}
            sx={{
              borderRadius: "8px",
              "& .MuiAlert-message": {
                fontSize: "14px",
                fontWeight: 500,
              },
            }}
          >
            {message?.text}
          </Alert>
        </Box>
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            borderRadius: "12px",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress
              size={40}
              color="#475569"
              sx={{ mb: 2 }}
              className="text-[#475569]"
            />
            <p style={{ color: "#6B7280", fontSize: "14px", fontWeight: 500 }}>
              Submitting your assessment request...
            </p>
          </Box>
        </Box>
      )}

      {/* --- Step Indicator --- */}
      <div className="relative flex items-center justify-between mb-16">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 -translate-y-1/2"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${((step - 1) / (steps?.length - 1)) * 100}%` }}
        ></div>
        {steps?.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = step > stepNumber;
          const isActive = step === stepNumber;
          return (
            <div
              key={stepNumber}
              className="flex flex-col items-center relative z-10 w-1/4 mt-6"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-blue-500 border-blue-500 text-white"
                      : isActive
                      ? "border-blue-500 text-blue-500 bg-white font-medium"
                      : "border-blue-300 text-blue-500 bg-white"
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`mt-2 sm:text-sm text-[12px] text-center ${
                  isActive
                    ? "text-gray-600 font-normal"
                    : isCompleted
                    ? "text-gray-900 font-normal"
                    : "text-gray-500 font-normal"
                }`}
              >
                {label === "Assessment & Scheduling" ? (
                  <>
                    <span className="sm:hidden">Assessment..</span>
                    <span className="hidden sm:inline">
                      Assessment & Scheduling
                    </span>
                  </>
                ) : (
                  label
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* ---- Step Forms ---- */}
      <div className="my-6">{getStepContent()}</div>
    </div>
  );
};

export default MultiStepForm;
