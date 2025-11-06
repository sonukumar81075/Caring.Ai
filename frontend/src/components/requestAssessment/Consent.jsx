// Consent.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ArrowLeft } from "lucide-react";
import AppointmentDetails from "../AppointmentDetails";

const Consent = ({ initialValues, validationSchema, onSubmit, prevStep }) => {
  const initialStepValues = {
    consentAccepted: initialValues.consentAccepted || false,
  };

  return (
    <Formik
      initialValues={initialStepValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit} // This is the parent's `handleSubmit` function
      enableReinitialize={true}
    >
      {({ isSubmitting, isValid, touched }) => (
        <Form>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Consent Confirmation
            </h3>
            <p className="text-gray-500 mb-6">
              Please confirm that proper consent has been obtained.
            </p>
            <AppointmentDetails initialValues={initialValues} />
            {/* Consent Checkbox */}
            <div className="flex items-start mb-10">
              <div className="flex items-center h-5">
                <Field
                  id="consentAccepted"
                  name="consentAccepted"
                  type="checkbox"
                  className="focus:ring-gray-500 h-4 w-4 text-gray-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="consentAccepted"
                  className="font-medium text-gray-700 cursor-pointer"
                >
                  I confirm that proper consent has been obtained from the
                  patient for this cognitive assessment{" "}
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500 mt-1">
                  By checking this box, you certify that the patient has been
                  informed about the assessment process and has given their
                  consent to participate.
                </p>
                <ErrorMessage
                  name="consentAccepted"
                  component="div"
                  className="text-red-500 text-xs mt-2"
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 text-gray-600 font-medium rounded-lg cursor-pointer border border-gray-300 transition duration-150 flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="block sm:hidden">Back</span>
              <span className="hidden sm:block">Back to Assessment & Scheduling</span>
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !isValid ||
                (Object.keys(touched).length === 0 &&
                  !initialValues.consentAccepted)
              }
              className="px-6 py-2.5 bg-color bg-hover text-white rounded-lg transition-colors duration-200 cursor-pointer font-medium disabled:opacity-50"
            >
              Review & Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Consent;
