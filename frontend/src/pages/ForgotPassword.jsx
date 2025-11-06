import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Mail, ArrowLeft } from "lucide-react";
import authService from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccessMessage(
          response.message || "Password reset link has been sent to your email."
        );
        setSuccess(true);
      } else {
        setError(
          response.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 480,
            width: "100%",
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <img
                src="/logo/logo.svg"
                alt="CaringAI Logo"
                style={{ height: "64px", width: "auto" }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}
            >
              Check Your Email
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "#64748b", lineHeight: 1.7 }}
            >
              {successMessage ||
                `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.`}
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              startIcon={<ArrowLeft />}
              sx={{
                background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
                },
                borderRadius: "8px",
                padding: "12px 32px",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(186, 163, 119, 0.3)",
              }}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 480,
          width: "100%",
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <div className="w-52 h-auto flex items-center  ">
              <img
                src="/logo/logo.svg"
                alt="CaringAI Logo"
                className="h-16 w-auto"
              />
            </div>
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}
          >
            Forgot Password?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#64748b", lineHeight: 1.5 }}
          >
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
              },
              borderRadius: "8px",
              padding: "14px",
              fontWeight: 600,
              fontSize: "16px",
              textTransform: "none",
              mb: 2,
              boxShadow: "0 4px 12px rgba(49, 91, 242, 0.3)",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowLeft />}
              sx={{
                color: "#BAA377",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#A8956A",
                },
              }}
            >
              Back to Login
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
