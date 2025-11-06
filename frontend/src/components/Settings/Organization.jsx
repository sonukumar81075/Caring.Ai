import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { DetailField } from "./DetailField";
import * as Yup from "yup";
import { Alert, CircularProgress, Box, Typography } from "@mui/material";
import organizationService from "../../services/organizationService";
import { useAuth } from "../../contexts/AuthContext";
import {
  OrganizationInformationManagement,
  OrganizationCreateManagement,
} from "../../DynamicData";
import CognitiveAssessmentdetails from "../requestAssessment/CognitiveAssessmentdetails";

const OrganizationSchema = Yup.object().shape({
  // --- Organization Details ---
  organizationName: Yup.string()
    .min(2, "Must be at least 2 characters")
    .max(100, "Must be 100 characters or less")
    .required("Organization Name is required"),

  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  phoneNumber: Yup.string()
    .matches(/^[0-9\-()\s]*$/, "Invalid phone number format")
    .nullable(),

  address: Yup.string()
    .max(250, "Address is too long")
    .required("Address is required"),

  // --- Contact Person ---
  contactPersonName: Yup.string().required("Contact Person Name is required"),
  contactPersonEmail: Yup.string()
    .email("Invalid email format")
    .required("Contact Person Email is required"),
  contactPersonPhone: Yup.string()
    .matches(/^[0-9\-()\s]*$/, "Invalid phone number format")
    .nullable(),
});

const OrganizationDetails = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch organization data
  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await organizationService.getMyOrganization();

      if (response?.success && response?.data) {
        const org = response.data;
        setCurrentData({
          organizationName: org?.organizationName || "",
          emailAddress: org?.emailAddress || "",
          phoneNumber: org?.phoneNumber || "",
          address: org?.address || "",
          contractStartDate: org?.contractStartDate
            ? new Date(org?.contractStartDate).toISOString().split("T")[0]
            : "",
          contractEndDate: org?.contractEndDate
            ? new Date(org?.contractEndDate).toISOString().split("T")[0]
            : "",
          contractDurationMonths: org?.contractDurationMonths || 12,
          gracePeriodDays: org?.gracePeriodDays || 7,
          contractStatus: org?.contractStatus || "Active",
          contactPersonName: org?.contactPersonName || "",
          contactPersonEmail: org?.contactPersonEmail || "",
          contactPersonPhone: org?.contactPersonPhone || "",
          superAdminName: org?.superAdmin?.name || "",
          superAdminEmail: org?.superAdmin?.email || "",
          superAdminPhone: org?.superAdmin?.phone || "",
        });
      }
    } catch (err) {
      console.error("Error loading organization:", err);
      // Don't show error if organization simply doesn't exist yet
      if (!err.message?.includes("No organization found")) {
        setError(err.message || "Failed to load organization details");
      }
      // Leave currentData as null to show create form
      setCurrentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancelClick = (resetForm) => {
    resetForm();
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("");
      setSuccess("");

      const updateData = {
        organizationName: values?.organizationName,
        emailAddress: values?.emailAddress,
        phoneNumber: values?.phoneNumber,
        address: values?.address,
        contactPersonName: values?.contactPersonName,
        contactPersonEmail: values?.contactPersonEmail,
        contactPersonPhone: values?.contactPersonPhone,
      };

      const response = await organizationService.updateOrganization(updateData);

      if (response.success) {
        setSuccess("Organization details updated successfully!");
        await loadOrganization();
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error updating organization:", err);
      setError(err.message || "Failed to update organization details");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If no organization exists, show create form
  if (!currentData) {
    return (
      <div className="w-full px-4 2xl:px-8">
        <div className="pb-6">
          <CognitiveAssessmentdetails
            NewAssessment={OrganizationCreateManagement}
            customClassType={"AddedCustomCss"}
          />
        </div>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{
            organizationName: user?.organizationName || "My Organization",
            emailAddress: user?.email || "",
            phoneNumber: user?.phone || "",
            address: "",
            contractStartDate: new Date().toISOString().split("T")[0],
            contractEndDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            )
              .toISOString()
              .split("T")[0],
            contractDurationMonths: 12, // Default to 1 year
            gracePeriodDays: 7, // Default grace period
            contactPersonName: user?.name || user?.email || "",
            contactPersonEmail: user?.email || "",
            contactPersonPhone: user?.phone || "",
          }}
          validationSchema={OrganizationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setError("");
              const response = await organizationService.createOrganization(
                values
              );

              if (response.success) {
                setSuccess("Organization created successfully!");
                await loadOrganization();
                setTimeout(() => setSuccess(""), 3000);
              }
            } catch (err) {
              console.error("Error creating organization:", err);
              setError(err.message || "Failed to create organization");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              {/* Organization Details */}
              <div className="form-section border-b border-gray-200 pb-4  mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Organization Details
                </h2>
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                  <DetailField
                    label="Organization Name"
                    name="organizationName"
                    isEditing={true}
                    readOnlyValue=""
                  />
                  <DetailField
                    label="Email Address"
                    name="emailAddress"
                    isEditing={true}
                    readOnlyValue=""
                  />
                  <DetailField
                    label="Phone Number"
                    name="phoneNumber"
                    isEditing={true}
                    readOnlyValue=""
                  />
                  <DetailField
                    label="Address"
                    name="address"
                    isEditing={true}
                    readOnlyValue=""
                  />
                </div>
              </div>

              {/* Contract Information - READ ONLY */}
              <div className="form-section border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Contract Information
                  </h2>
                  <span className="text-sm text-red-500 italic">
                    (Read Only - Default 1 Year Contract)
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                  <DetailField
                    label="Contract Start Date"
                    name="contractStartDate"
                    type="date"
                    isEditing={false} // Always read-only
                    readOnlyValue={new Date().toISOString().split("T")[0]}
                  />
                  <DetailField
                    label="Contract Duration"
                    name="contractDurationMonths"
                    isEditing={false} // Always read-only
                    readOnlyValue="1 Year (12 months)"
                  />
                </div>
              </div>

              {/* Contact Person Details */}
              <div className="form-section border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Contact Person Details
                </h2>
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                  <DetailField
                    label="Contact Person Name"
                    name="contactPersonName"
                    isEditing={true}
                    readOnlyValue=""
                  />
                  <DetailField
                    label="Contact Person Email"
                    name="contactPersonEmail"
                    isEditing={true}
                    readOnlyValue=""
                  />
                  <DetailField
                    label="Contact Person Phone"
                    name="contactPersonPhone"
                    isEditing={true}
                    readOnlyValue=""
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 mb-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-color text-white font-medium rounded-lg cursor-pointer shadow-md bg-hover transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isValid || !dirty || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  }

  return (
    <div className=" w-full px-4 2xl:px-8 pb-6">
      <CognitiveAssessmentdetails
        NewAssessment={OrganizationInformationManagement}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          {success}
        </Alert>
      )}

      <Formik
        initialValues={currentData || {}}
        validationSchema={OrganizationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, isValid, dirty, resetForm }) => (
          <Form>
            {/* --- HEADER/ACTION BUTTONS --- */}

            {/* --- FORM SECTIONS --- */}

            {/* Organization Details - EDITABLE */}
            <div className="form-section border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Organization Details
              </h2>
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                <DetailField
                  label="Organization Name"
                  name="organizationName"
                  isEditing={isEditing}
                  readOnlyValue={currentData?.organizationName || ""}
                />
                <DetailField
                  label="Email Address"
                  name="emailAddress"
                  isEditing={isEditing}
                  readOnlyValue={currentData?.emailAddress || ""}
                />
                <DetailField
                  label="Phone Number"
                  name="phoneNumber"
                  isEditing={isEditing}
                  readOnlyValue={currentData?.phoneNumber || ""}
                />
                <DetailField
                  label="Address"
                  name="address"
                  isEditing={isEditing}
                  readOnlyValue={currentData?.address || ""}
                />
              </div>
            </div>

            {/* Contract Information - READ ONLY */}
            <div className="form-section border-b border-gray-200 pb-4 mb-6">
              <div className="sm:flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Contract Information
                </h2>
                <span className="text-sm text-red-500 italic">
                  (Read Only - Contact SuperAdmin to modify)
                </span>
              </div>
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                <DetailField
                  label="Contract Start Date"
                  name="contractStartDate"
                  type="date"
                  isEditing={false} // Always read-only
                  readOnlyValue={currentData?.contractStartDate || ""}
                />
                <DetailField
                  label="Contract End Date"
                  name="contractEndDate"
                  type="date"
                  isEditing={false} // Always read-only
                  readOnlyValue={currentData?.contractEndDate || ""}
                />
                <DetailField
                  label="Contract Duration"
                  name="contractDurationMonths"
                  isEditing={false} // Always read-only
                  readOnlyValue={
                    currentData?.contractDurationMonths
                      ? `${currentData?.contractDurationMonths} months`
                      : "12 months"
                  }
                />
                <DetailField
                  label="Grace Period"
                  name="gracePeriodDays"
                  isEditing={false} // Always read-only
                  readOnlyValue={
                    currentData?.gracePeriodDays
                      ? `${currentData?.gracePeriodDays} days`
                      : "7 days"
                  }
                />
                <DetailField
                  label="Contract Status"
                  name="contractStatus"
                  isEditing={false} // Always read-only
                  readOnlyValue={currentData?.contractStatus || ""}
                />
              </div>
            </div>

            {/* Contact Person Details - EDITABLE */}
            <div className="form-section  pb-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Contact Person Details
              </h2>
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                <DetailField
                  label="Contact Person Name"
                  name="contactPersonName"
                  isEditing={isEditing}
                  readOnlyValue={currentData?.contactPersonName || ""}
                />
                <DetailField
                  label="Contact Person Email"
                  name="contactPersonEmail"
                  isEditing={isEditing}
                  readOnlyValue={currentData?.contactPersonEmail || ""}
                />
                <DetailField
                  label="Contact Person Phone"
                  name="contactPersonPhone"
                  isEditing={isEditing}
                  readOnlyValue={currentData?.contactPersonPhone || ""}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 mt-6 pt-6  gap-3">
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="px-6 py-2 bg-color text-white font-medium rounded-md shadow-md bg-hover w-full sm:w-fit mb-3 sm:mb-0 cursor-pointer transition duration-150"
                >
                  Edit Details
                </button>
              )}

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCancelClick(resetForm)}
                    className="px-6 py-2 text-gray-600 font-medium rounded-lg cursor-pointer shadow-sm  w-full sm:w-fit mb-3 sm:mb-0 border border-gray-300 transition duration-150"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-color text-white font-medium rounded-lg cursor-pointer shadow-md  w-full sm:w-fit mb-3 sm:mb-0 bg-hover transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isValid || !dirty || isSubmitting}
                  >
                    <span className="hidden sm:block">
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </span>
                    <span className="sm:hidden block">
                      {isSubmitting ? "Saving..." : "Save"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OrganizationDetails;
