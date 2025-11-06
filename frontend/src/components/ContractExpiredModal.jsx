import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  WarningAmber,
  CalendarToday,
  HourglassEmpty,
  Send,
  Close,
} from "@mui/icons-material";

const ContractExpiredModal = ({
  open,
  contractInfo,
  onRequestRenewal,
  onClose,
  allowClose = false, // Can't close if contract is completely expired
}) => {
  const [message, setMessage] = useState("");
  const [requestedDuration, setRequestedDuration] = useState(12);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onRequestRenewal({
        message,
        requestedDurationMonths: requestedDuration,
      });
      setSuccess(true);
      setTimeout(() => {
        setMessage("");
        setRequestedDuration(12);
        setSuccess(false);
        if (allowClose && onClose) onClose();
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to submit renewal request");
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = contractInfo?.daysUntilExpiry || 0;
  const isInGracePeriod = contractInfo?.isInGracePeriod || false;
  const isExpired = daysRemaining < 0;

  // Determine severity
  let severity = "warning";
  let title = "Contract Expiring Soon";
  if (isExpired && !isInGracePeriod) {
    severity = "error";
    title = "Contract Expired";
  } else if (isInGracePeriod) {
    severity = "error";
    title = "Contract Expired - Grace Period Active";
  }

  return (
    <Dialog
      open={open}
      onClose={allowClose ? onClose : null}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={!allowClose}
    >
      <DialogTitle
        sx={{
          pb: 2,
          backgroundColor: severity === "error" ? "#fee2e2" : "#fef3c7",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WarningAmber
            sx={{
              fontSize: 32,
              color: severity === "error" ? "#dc2626" : "#f59e0b",
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              {contractInfo?.organizationName}
            </Typography>
          </Box>
          {allowClose && (
            <Button onClick={onClose} sx={{ minWidth: "auto", p: 0.5 }}>
              <Close />
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {success ? (
          <Alert severity="success" sx={{ mb: 3, mt: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              ✓ Renewal request submitted successfully!
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
              SuperAdmin has been notified and will review your request shortly.
            </Typography>
          </Alert>
        ) : (
          <>
            {/* Contract Status Alert */}
            <Alert severity={severity} sx={{ mb: 3, mt: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {isExpired && !isInGracePeriod && (
                  <>
                    Your contract has expired and you can no longer perform
                    actions in the system.
                  </>
                )}
                {isInGracePeriod && (
                  <>
                    Your contract has expired. You are in a{" "}
                    {contractInfo?.gracePeriodDays}-day grace period.
                  </>
                )}
                {!isExpired && (
                  <>Your contract will expire in {daysRemaining} days.</>
                )}
              </Typography>
            </Alert>

            {/* Contract Details */}
            <Box
              sx={{
                backgroundColor: "#f8fafc",
                borderRadius: 2,
                p: 3,
                mb: 3,
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 2, color: "#475569" }}
              >
                Contract Information
              </Typography>

              <div
                className={`grid  ${
                  isInGracePeriod ? "grid-cols-4" : "grid-cols-3"
                }`}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Start Date:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "#1e293b" }}
                  >
                    {new Date(
                      contractInfo?.contractStartDate
                    ).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    End Date:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "#1e293b" }}
                  >
                    {new Date(
                      contractInfo?.contractEndDate
                    ).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HourglassEmpty sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Status:
                  </Typography>
                  <Chip
                    label={contractInfo?.contractStatus || "Unknown"}
                    size="small"
                    color={
                      contractInfo?.contractStatus === "Active"
                        ? "success"
                        : "error"
                    }
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                {isInGracePeriod && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HourglassEmpty sx={{ fontSize: 18, color: "#64748b" }} />
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Grace Period:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#64748b" }}
                    >
                      {contractInfo?.gracePeriodDays} days
                    </Typography>
                  </Box>
                )}
              </div>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Renewal Request Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}
              >
                Request Contract Renewal
              </Typography>

              <Typography variant="body2" sx={{ mb: 3, color: "#64748b" }}>
                Submit a renewal request to your SuperAdmin. They will review
                and approve your request.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Requested Duration</InputLabel>
                <Select
                  value={requestedDuration}
                  onChange={(e) => setRequestedDuration(e.target.value)}
                  label="Requested Duration"
                  disabled={loading}
                >
                  <MenuItem value={1}>1 Month</MenuItem>
                  <MenuItem value={3}>3 Months</MenuItem>
                  <MenuItem value={6}>6 Months</MenuItem>
                  <MenuItem value={12}>1 Year</MenuItem>
                  <MenuItem value={24}>2 Years</MenuItem>
                  <MenuItem value={36}>3 Years</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message (Optional)"
                placeholder="Explain why you need the renewal..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                sx={{ mb: 3 }}
              />

              <DialogActions sx={{ px: 0, pb: 0 }}>
                {allowClose && (
                  <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="contained"
                    sx={{
                      backgroundColor: "#BAA377",
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "#A8956A",
                        color: "#ffffff",
                      },
                      "&:disabled": {
                        backgroundColor: "#d1d5db",
                        color: "#9ca3af",
                        opacity: 0.6,
                      },
                    }}
                  >
                    Close
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={16} /> : <Send />
                  }
                  sx={{
                    backgroundColor: "#BAA377",
                    "&:hover": {
                      backgroundColor: "#A8956A",
                    },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {loading ? "Submitting..." : "Submit Renewal Request"}
                </Button>
              </DialogActions>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContractExpiredModal;
