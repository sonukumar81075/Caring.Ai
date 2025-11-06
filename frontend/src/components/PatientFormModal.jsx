import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Person, Email, Phone, Cake, CalendarToday } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: 400, // mobile
    sm: 500, // tablet and above
  },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  maxHeight: "90vh",
  overflow: "auto",
};

const PatientFormModal = ({ open, onClose, onSubmit, editingPatient }) => {
  // eslint-disable-next-line no-unused-vars
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [calculatedAge, setCalculatedAge] = useState("");

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) {
      setCalculatedAge("");
      return;
    }

    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    setCalculatedAge(age.toString());
    return age;
  };

  useEffect(() => {
    if (editingPatient && editingPatient?.dateOfBirth) {
      const dob = new Date(editingPatient?.dateOfBirth);
      setDateOfBirth(dob);
      calculateAge(dob);
    } else if (editingPatient && editingPatient?.age) {
      // If editing patient without DOB, show the existing age
      setCalculatedAge(editingPatient?.age.toString());
    }
  }, [editingPatient]);

  const validationSchema = yup.object({
    name: yup
      .string()
      .required("Patient name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    email: yup
      .string()
      .required("Email address is required")
      .email("Please enter a valid email address")
      .max(255, "Email cannot exceed 255 characters"),
    contactNo: yup
      .string()
      .required("Contact number is required")
      .min(10, "Contact number must be at least 10 digits")
      .max(20, "Contact number must not exceed 20 characters"),
    dateOfBirth: yup
      .date()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future")
      .test("age", "Age must be between 0 and 150 years", function (value) {
        if (!value) return false; // Date of birth is now required
        const age = calculateAge(value);
        return age >= 0 && age <= 150;
      }),
  });

  const initialValues = {
    name: editingPatient?.name || "",
    email: editingPatient?.email || "",
    contactNo: editingPatient?.contactNo || "",
    dateOfBirth: editingPatient?.dateOfBirth
      ? new Date(editingPatient?.dateOfBirth)
      : null,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        // Calculate age from date of birth (now required)
        const age = calculateAge(values.dateOfBirth);

        const patientData = {
          ...values,
          age: age,
          dateOfBirth: values.dateOfBirth,
        };

        await onSubmit(patientData);

        onClose();
      } catch (error) {
        console.error("Error submitting patient form:", error);
        setFieldError("general", error.message || "Failed to save patient");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Modal open={open} onClose={onClose}>
        <Box sx={style} component="form" onSubmit={formik.handleSubmit}>
          <Typography variant="h6" component="h2" gutterBottom>
            {editingPatient ? "Edit Patient" : "Add New Patient"}
          </Typography>

          {/* HIPAA Notice */}
          <Alert
            severity=""
            sx={{
              mb: 3,
              bgcolor: "#f3f4f6",
              borderColor: "#bae6fd",
              color: "#4b5563",
              fontFamily: "Inter, sans-serif",
            }}
          >
            This form collects Protected Health Information (PHI) and is secured
            in compliance with HIPAA regulations.
          </Alert>

          {/* Patient Name */}
          <TextField
            fullWidth
            name="name"
            label="Patient Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Email Address */}
          <TextField
            fullWidth
            name="email"
            label="Email Address"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Contact Number */}
          <TextField
            fullWidth
            name="contactNo"
            label="Contact Number"
            value={formik.values.contactNo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contactNo && Boolean(formik.errors.contactNo)}
            helperText={formik.touched.contactNo && formik.errors.contactNo}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Date of Birth */}
          <DatePicker
            label="Date of Birth"
            value={formik.values.dateOfBirth}
            onChange={(date) => {
              formik.setFieldValue("dateOfBirth", date);
              setDateOfBirth(date);
              calculateAge(date);
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error:
                  formik.touched.dateOfBirth &&
                  Boolean(formik.errors.dateOfBirth),
                helperText:
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Cake />
                    </InputAdornment>
                  ),
                },
                sx: { mb: 2 },
              },
            }}
            maxDate={new Date()}
            disableFuture
          />

          {/* Age Field - Read Only */}
          <TextField
            fullWidth
            name="age"
            label="Age"
            value={
              calculatedAge
                ? `${calculatedAge} years`
                : "Select date of birth to calculate age"
            }
            disabled
            helperText="Age will be automatically calculated from date of birth"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* General Error */}
          {formik.errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formik.errors.general}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}
          >
            <Button
              onClick={onClose}
              variant="contained"
              style={{
                backgroundColor: "#BAA377",
                color: "#ffffff",
                borderRadius: "6px",
                fontWeight: "500",
                padding: "7px 24px",
                border: "1px solid #BAA377",
                fontFamily: "Inter, sans-serif",
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "#A8956A",
                  color: "#ffffff",
                  borderColor: "#A8956A",
                },
                "&:disabled": {
                  backgroundColor: "#d1d5db",
                  color: "#9ca3af",
                  borderColor: "#d1d5db",
                  opacity: 0.6,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                background: "#334155",
                "&:hover": {
                  background: "#192636",
                },
                "&:disabled": {
                  backgroundColor: "#d1d5db",
                  color: "#9ca3af",
                  opacity: 0.6,
                },
                padding: "7px 20px",
                borderRadius: "6px",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 2px 8px rgba(31, 48, 68, 0.3)",
              }}
            >
              {editingPatient ? "Update Patient" : "Add Patient"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default PatientFormModal;
