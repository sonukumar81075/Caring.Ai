import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Person, Email, Phone, MedicalServices } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: 400,
    sm: 500,
  },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  maxHeight: "90vh",
  overflow: "auto",
};

const validationSchema = yup.object({
  name: yup
    .string()
    .required("Doctor name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: yup
    .string()
    .required("Email address is required")
    .email("Please enter a valid email address")
    .max(255, "Email cannot exceed 255 characters"),
  phone: yup
    .string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters"),
  specialty: yup
    .string()
    .required("Medical specialty is required")
    .min(2, "Specialty must be at least 2 characters")
    .max(100, "Specialty cannot exceed 100 characters"),
});

const DoctorFormModal = ({ open, onClose, onSubmit, editingDoctor }) => {
  const initialValues = {
    name: editingDoctor?.name || "",
    email: editingDoctor?.email || "",
    phone: editingDoctor?.phone || "",
    specialty: editingDoctor?.specialty || "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await onSubmit(values);
        onClose();
      } catch (error) {
        console.error("Error submitting doctor form:", error);
        setFieldError("general", error.message || "Failed to save doctor");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={formik.handleSubmit}>
        <Typography variant="h6" component="h2" gutterBottom>
          {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
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

        {/* Doctor Name */}
        <TextField
          fullWidth
          name="name"
          label="Doctor Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ fontFamily: "Inter, sans-serif" }}
              >
                <Person />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, fontFamily: "Inter, sans-serif" }}
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
            // You might want to adjust the icon's color to gray to match the image
            sx: {
              "& .MuiInputAdornment-root .MuiSvgIcon-root": {
                color: "grey.600", // Example: make the icon gray
              },
            },
          }}
          sx={{ mb: 2, fontFamily: "Inter, sans-serif" }}
        />

        {/* Phone Number */}
        <TextField
          fullWidth
          name="phone"
          label="Phone Number"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && formik.errors.phone}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, fontFamily: "Inter, sans-serif" }}
        />

        {/* Medical Specialty */}
        <TextField
          fullWidth
          name="specialty"
          label="Medical Specialty"
          value={formik.values.specialty}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.specialty && Boolean(formik.errors.specialty)}
          helperText={formik.touched.specialty && formik.errors.specialty}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MedicalServices />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, fontFamily: "Inter, sans-serif" }}
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
            style={{
              backgroundColor: "#ffffff",
              color: "#475569",
              borderRadius: "6px",
              fontWeight: "500",
              padding: "7px 24px",
              border: "1px solid #9ca3af",
              fontFamily: "Inter, sans-serif",
            }}
            onClick={onClose}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
              },
              padding: "7px 20px",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
            }}
          >
            {editingDoctor ? "Update Doctor" : "Add Doctor"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DoctorFormModal;
