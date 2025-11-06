import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Lock, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LockScreen = ({ open, onUnlock }) => {
  const { user, login } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const passwordInputRef = useRef(null);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 30000; // 30 seconds

  // Focus password input when modal opens
  useEffect(() => {
    if (open && passwordInputRef.current) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTime) {
      const timer = setTimeout(() => {
        setLockoutTime(null);
        setAttempts(0);
        setError("");
      }, LOCKOUT_DURATION);

      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle unlock
  const handleUnlock = async (e) => {
    e.preventDefault();

    if (lockoutTime) {
      setError(
        `Too many failed attempts. Please wait ${Math.ceil(
          (lockoutTime - Date.now()) / 1000
        )} seconds.`
      );
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify password by attempting to login with isUnlock flag to bypass 2FA/Captcha
      const result = await login(
        {
          email: user?.email,
          password: password,
        },
        {
          isUnlock: true, // This flag tells the backend to skip 2FA/Captcha verification
        }
      );

      if (result.success) {
        // Password correct, unlock screen
        setPassword("");
        setAttempts(0);
        setError("");
        onUnlock();
      } else {
        // Password incorrect
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutTime(Date.now() + LOCKOUT_DURATION);
          setError(`Too many failed attempts. Locked for 30 seconds.`);
        } else {
          setError(
            `Incorrect password. ${
              MAX_ATTEMPTS - newAttempts
            } attempt(s) remaining.`
          );
        }
        setPassword("");
      }
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      console.log(err);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutTime(Date.now() + LOCKOUT_DURATION);
        setError(`Too many failed attempts. Locked for 30 seconds.`);
      } else {
        setError(
          `Incorrect password. ${
            MAX_ATTEMPTS - newAttempts
          } attempt(s) remaining.`
        );
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {}} // Prevent closing by clicking outside
      aria-labelledby="lock-screen-modal"
      disableEscapeKeyDown={true}
      hideBackdrop={false}
      sx={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 9999, // Ensure it's on top of everything
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: "90%",
            sm: 450,
          },
          bgcolor: "background.paper",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          borderRadius: 3,
          p: 4,
          outline: "none",
        }}
      >
        {/* Lock Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "#BAA377",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(71, 85, 105, 0.3)",
            }}
          >
            <Lock size={40} color="#ffffff" />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          id="lock-screen-modal"
          variant="h5"
          component="h2"
          sx={{
            textAlign: "center",
            fontWeight: 600,
            mb: 1,
            color: "#1F2937",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Screen Locked
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            textAlign: "center",
            mb: 3,
            color: "#6B7280",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Enter your password to unlock
        </Typography>

        {/* User Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 3,
            p: 2,
            backgroundColor: "#F9FAFB",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "#BAA377",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: "#1F2937",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {user?.username || "User"}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: "#6B7280",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {user?.role || "Administrator"}
            </Typography>
          </Box>
        </Box>

        {/* Time */}
        <Typography
          sx={{
            textAlign: "center",
            mb: 3,
            color: "#9CA3AF",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {getCurrentTime()}
        </Typography>

        {/* Error Message */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
            }}
            icon={<AlertCircle size={20} />}
          >
            {error}
          </Alert>
        )}

        {/* Password Form */}
        <form onSubmit={handleUnlock}>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || !!lockoutTime}
            inputRef={passwordInputRef}
            className="rounded-2xl"
            sx={{
              mb: 2,
              fontFamily: "Inter, sans-serif",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#D1D5DB",
                },
                "&:hover fieldset": {
                  borderColor: "#9CA3AF",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#475569",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={20} color="#6B7280" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading || !!lockoutTime || !password}
            sx={{
              background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
              },
              "&:disabled": {
                backgroundColor: "#9CA3AF",
              },
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
            }}
          >
            {loading ? "Unlocking..." : "Unlock"}
          </Button>
        </form>

        {/* Security Info */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "#F3F4F6",
            borderRadius: 2,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <Shield
            size={18}
            color="#475569"
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <Typography
            sx={{
              fontSize: "12px",
              color: "#4B5563",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.5,
            }}
          >
            Your screen is locked for security. Enter your password to continue
            working. The session remains active in the background.
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default LockScreen;
