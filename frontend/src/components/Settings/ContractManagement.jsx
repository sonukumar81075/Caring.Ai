import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Pause as SuspendIcon,
  PlayArrow as ActivateIcon,
  CheckCircle,
  Cancel,
  History as HistoryIcon,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  Warning,
} from "@mui/icons-material";
import organizationService from "../../services/organizationService";
// import { useAuth } from "../../contexts/AuthContext";
import { EditIcon } from "lucide-react";

const ContractManagement = () => {
  // const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showReduceModal, setShowReduceModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form states
  const [extendMonths, setExtendMonths] = useState(6);
  const [reduceMonths, setReduceMonths] = useState(3);
  const [updateData, setUpdateData] = useState({
    contractDurationMonths: 12,
    gracePeriodDays: 7,
    contractStatus: "Active",
  });
  const [notes, setNotes] = useState("");
  const [approvalDuration, setApprovalDuration] = useState(12);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      // SuperAdmin gets all Admin organizations
      const response = await organizationService.getAllOrganizations({
        limit: 100,
      });

      if (response.success) {
        setOrganizations(response.data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendContract = async () => {
    try {
      setError("");
      const response = await organizationService.extendContract(
        selectedOrg._id,
        {
          additionalMonths: extendMonths,
          notes: notes || `Extended by ${extendMonths} months`,
        }
      );

      if (response.success) {
        setSuccess(
          `${selectedOrg.organizationName}: Contract extended by ${extendMonths} months!`
        );
        setShowExtendModal(false);
        setExtendMonths(6);
        setNotes("");
        await loadOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to extend contract");
    }
  };

  const handleReduceContract = async () => {
    try {
      setError("");
      const response = await organizationService.reduceContract(
        selectedOrg._id,
        {
          reduceMonths: reduceMonths,
          notes: notes || `Reduced by ${reduceMonths} months`,
        }
      );

      if (response.success) {
        setSuccess(
          `${selectedOrg.organizationName}: Contract reduced by ${reduceMonths} months!`
        );
        setShowReduceModal(false);
        setReduceMonths(3);
        setNotes("");
        await loadOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to reduce contract");
    }
  };

  const handleUpdateContract = async () => {
    try {
      setError("");
      const response = await organizationService.updateContract(
        selectedOrg._id,
        {
          ...updateData,
          notes: notes || "Contract updated",
        }
      );

      if (response.success) {
        setSuccess(
          `${selectedOrg.organizationName}: Contract updated successfully!`
        );
        setShowUpdateModal(false);
        setNotes("");
        await loadOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update contract");
    }
  };

  const handleSuspendContract = async (org) => {
    try {
      setError("");
      const response = await organizationService.updateContract(org._id, {
        contractStatus: "Suspended",
        notes: "Contract suspended by SuperAdmin",
      });

      if (response.success) {
        setSuccess(`${org.organizationName}: Contract suspended!`);
        await loadOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to suspend contract");
    }
  };

  const handleActivateContract = async (org) => {
    try {
      setError("");
      const response = await organizationService.updateContract(org._id, {
        contractStatus: "Active",
        notes: "Contract activated by SuperAdmin",
      });

      if (response.success) {
        setSuccess(`${org.organizationName}: Contract activated!`);
        await loadOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to activate contract");
    }
  };

  const handleApproveRenewal = async (orgId, requestId) => {
    try {
      setError("");
      const response = await organizationService.approveRenewal(
        orgId,
        requestId,
        {
          durationMonths: approvalDuration,
          notes: notes || "Renewal approved",
        }
      );

      if (response.success) {
        setSuccess("Renewal request approved successfully!");
        setShowRenewalModal(false);
        setSelectedRequest(null);
        setSelectedOrg(null);
        setApprovalDuration(12);
        setNotes("");
        await loadOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to approve renewal");
    }
  };

  // const handleRejectRenewal = async (orgId, requestId) => {
  //   const reason = window.prompt("Enter reason for rejection:");
  //   if (!reason) return;

  //   try {
  //     setError("");
  //     const response = await organizationService.rejectRenewal(
  //       orgId,
  //       requestId,
  //       { notes: reason }
  //     );

  //     if (response.success) {
  //       setSuccess("Renewal request rejected");
  //       await loadOrganizations();
  //       setTimeout(() => setSuccess(""), 3000);
  //     }
  //   } catch (err) {
  //     setError(err.message || "Failed to reject renewal");
  //   }
  // };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="sm:px-4 px-3 pb-6">
      <div className="bg-white w-full rounded-xl border border-gray-200 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] mt-6  outline-1 outline-offset-[-1px] outline-white/40  sm:mb-6 mb-3">
        <div className="p-6  w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center w-full space-x-3">
              <div className=" sm:block hidden  ">
                <div className="w-8 h-8 bg-blue-100   rounded-lg flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-gray-600  "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="sm:flex  w-full items-center justify-between">
                <h2 className="sm:text-xl text-lg font-semibold text-gray-900  ">
                  Admin Contract Management
                </h2>
                <p className="text-sm text-gray-600  ">
                  {organizations.length} Organization
                  {organizations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {organizations.length === 0 ? (
        <Alert severity="info">
          No Admin organizations found. Admin users will create organizations
          when they sign up.
        </Alert>
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
          {organizations.map((org) => {
            const daysUntilExpiry = org.contractValidity?.daysUntilExpiry || 0;
            const isExpired = daysUntilExpiry < 0;
            const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            const isSuspended = org.contractStatus === "Suspended";
            const statusColor = isSuspended
              ? "error"
              : isExpired
              ? "error"
              : isExpiringSoon
              ? "warning"
              : "success";
            const pendingRequests =
              org.renewalRequests?.filter((r) => r.status === "Pending")
                .length || 0;

            return (
              <Grid item xs={12} key={org._id}>
                <div
                  className={`bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-300 
            flex flex-col justify-between ${
              pendingRequests ? "min-h-[320px] h-full" : "h-full"
            } transition-all`}
                >
                  <CardContent className="flex flex-col justify-between h-full">
                    {/* Top section */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          className="sm:text-xl text-lg! text-gray-800"
                          sx={{ fontWeight: 600 }}
                        >
                          {org.organizationName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {org?.adminUsers.map((a) => a?.name).join(", ")}
                          {org?.adminUsers && org?.adminUsers?.length > 0 && (
                            <span>
                              {org?.adminUsers?.some((a) => a?.name) && (
                                <span className="px-1">-</span>
                              )}
                              {org?.adminUsers.map((a) => a?.email).join(", ")}
                            </span>
                          )}
                        </Typography>
                      </Box>
                      <Chip
                        label={org.contractStatus || "Unknown"}
                        color={statusColor}
                        sx={{ fontWeight: 600 }}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Middle section */}
                    <Grid
                      className="grid md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 grid-cols-2 gap-4"
                      sx={{ mb: 3, mt: 3 }}
                    >
                      <Grid item xs={6} sm={3}>
                        <Box className="text-center p-2 bg-[#f8fafc] rounded-lg">
                          <Typography
                            className="text-xl! sm:text-2xl!"
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color:
                                daysUntilExpiry < 0 ? "#dc2626" : "#475569",
                            }}
                          >
                            {Math.abs(daysUntilExpiry)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Days {daysUntilExpiry < 0 ? "Overdue" : "Left"}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box className="text-center p-2 bg-[#f8fafc] rounded-lg">
                          <Typography
                            variant="h5"
                            className="text-xl! sm:text-2xl!"
                            sx={{ fontWeight: 700, color: "#475569" }}
                          >
                            {org.contractDurationMonths}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Months
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box className="text-center p-2 bg-[#f8fafc] rounded-lg">
                          <Typography
                            variant="h6"
                            className="text-xl! sm:text-2xl!"
                            sx={{ fontWeight: 700, color: "#475569" }}
                          >
                            {new Date(
                              org.contractStartDate
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Start Date
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box className="text-center p-2 bg-[#f8fafc] rounded-lg">
                          <Typography
                            variant="h6"
                            className="text-xl! sm:text-2xl!"
                            sx={{ fontWeight: 700, color: "#475569" }}
                          >
                            {new Date(org.contractEndDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            End Date
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Alerts */}
                    <div className="space-y-2">
                      {isExpired && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          ⚠️ Expired! Admin users are blocked.
                        </Alert>
                      )}
                      {isExpiringSoon && !isExpired && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          Expiring in {daysUntilExpiry} days
                        </Alert>
                      )}
                      {pendingRequests > 0 && (
                        <Alert severity="info" sx={{ mb: 1 }}>
                          📋 {pendingRequests} pending renewal request
                          {pendingRequests !== 1 ? "s" : ""}
                        </Alert>
                      )}
                    </div>

                    {/* Bottom action buttons */}
                    {/* Action Buttons */}
                    <Box
                      className={`grid ${
                        pendingRequests
                          ? "grid-cols-3"
                          : " md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                      }  gap-4`}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<TrendingUp />}
                        style={{
                          borderRadius: "6px",
                          fontWeight: "500",
                          padding: "7px 24px",
                          fontFamily: "Inter, sans-serif",
                        }}
                        onClick={() => {
                          setSelectedOrg(org);

                          setShowExtendModal(true);
                        }}
                      >
                        Extend
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        style={{
                          borderRadius: "6px",
                          fontWeight: "500",
                          padding: "7px 24px",
                          fontFamily: "Inter, sans-serif",
                        }}
                        startIcon={<TrendingDown />}
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowReduceModal(true);
                        }}
                      >
                        Reduce
                      </Button>

                      {isSuspended ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ActivateIcon />}
                          onClick={() => handleActivateContract(org)}
                          style={{
                            borderRadius: "6px",
                            fontWeight: "500",
                            padding: "7px 24px",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<SuspendIcon />}
                          onClick={() => handleSuspendContract(org)}
                          style={{
                            borderRadius: "6px",
                            fontWeight: "500",
                            padding: "7px 24px",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon size={18} />}
                        onClick={() => {
                          setSelectedOrg(org);
                          setUpdateData({
                            contractDurationMonths: org.contractDurationMonths,
                            gracePeriodDays: org.gracePeriodDays,
                            contractStatus: org.contractStatus,
                          });
                          setShowUpdateModal(true);
                        }}
                        style={{
                          backgroundColor: "#BAA377",
                          color: "#ffffff",
                          borderRadius: "6px",
                          fontWeight: "500",
                          padding: "7px 24px",
                          border: "1px solid #9ca3af",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Custom
                      </Button>

                      {pendingRequests > 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          style={{
                            borderRadius: "6px",
                            fontWeight: "500",
                            padding: "7px 12px",
                            fontFamily: "Inter, sans-serif",
                          }}
                          // startIcon={<CheckCircle />}
                          onClick={() => {
                            const pendingRequest = org.renewalRequests.find(
                              (r) => r.status === "Pending"
                            );
                            setSelectedOrg(org);
                            setSelectedRequest(pendingRequest);
                            setApprovalDuration(
                              pendingRequest.requestedDurationMonths
                            );
                            setShowRenewalModal(true);
                          }}
                        >
                          Review Renewal ({pendingRequests})
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </div>
              </Grid>
            );
          })}
        </div>
      )}

      {/* Extend Modal */}
      <Dialog
        open={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "6px",
          },
        }}
      >
        <DialogTitle>
          {/* <TrendingUp sx={{ mr: 1, verticalAlign: "middle" }} /> */}
          Extend Contract
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: "#64748b" }}>
            Add additional months to the current contract end date.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Add Months</InputLabel>
            <Select
              value={extendMonths}
              onChange={(e) => setExtendMonths(e.target.value)}
              label="Add Months"
            >
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months (1 Year)</MenuItem>
              <MenuItem value={24}>24 Months (2 Years)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for extension..."
          />

          {selectedOrg && (
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              <strong>{selectedOrg.organizationName}</strong>
              <br />
              Current End Date:{" "}
              {new Date(selectedOrg.contractEndDate).toLocaleDateString()}
              <br />
              New End Date:{" "}
              {new Date(
                new Date(selectedOrg.contractEndDate).getTime() +
                  extendMonths * 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </Alert>
          )}
        </DialogContent>
        <div className="flex justify-end gap-4 px-6 pb-5">
          <Button
            style={{
              backgroundColor: "#ffffff", // Background color
              color: "#6b7280", // Text color
              borderRadius: "6px", // Rounded corners
              padding: "7px 16px", // Padding
              border: "1px solid #9ca3af", // Border style
              fontFamily: "Inter, sans-serif",
            }}
            onClick={() => setShowExtendModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleExtendContract}
            sx={{
              background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
              },
              "&:disabled": {
                backgroundColor: "grey.500",
              },
              borderRadius: "6px",
              padding: {
                xs: "8px 12px",
                sm: "8px 20px",
              },
              fontWeight: "500",
              textTransform: "none",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Extend by {extendMonths} Months
          </Button>
        </div>
      </Dialog>

      {/* Reduce Modal */}
      <Dialog
        open={showReduceModal}
        onClose={() => setShowReduceModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "6px",
          },
        }}
      >
        <DialogTitle>
          {/* <TrendingDown sx={{ mr: 1, verticalAlign: "middle" }} /> */}
          Reduce Contract
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: "#64748b" }}>
            Remove months from the current contract end date.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Remove Months</InputLabel>
            <Select
              value={reduceMonths}
              onChange={(e) => setReduceMonths(e.target.value)}
              label="Remove Months"
            >
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months (1 Year)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Required)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for reduction..."
            required
          />

          {selectedOrg && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>{selectedOrg.organizationName}</strong>
              <br />
              Current End Date:{" "}
              {new Date(selectedOrg.contractEndDate).toLocaleDateString()}
              <br />
              New End Date:{" "}
              {new Date(
                new Date(selectedOrg.contractEndDate).getTime() -
                  reduceMonths * 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
              <br />
              {new Date(
                new Date(selectedOrg.contractEndDate).getTime() -
                  reduceMonths * 30 * 24 * 60 * 60 * 1000
              ) < new Date() && (
                <strong style={{ color: "#dc2626" }}>
                  ⚠️ Contract will EXPIRE immediately!
                </strong>
              )}
            </Alert>
          )}
        </DialogContent>
        <div className="flex justify-end gap-4 px-6 pb-5">
          <Button
            style={{
              backgroundColor: "#ffffff", // Background color
              color: "#6b7280", // Text color
              borderRadius: "6px", // Rounded corners
              padding: "7px 16px", // Padding
              border: "1px solid #9ca3af", // Border style
              fontFamily: "Inter, sans-serif",
            }}
            onClick={() => setShowReduceModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleReduceContract}
            disabled={!notes}
            sx={{
              background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
              },
              "&:disabled": {
                backgroundColor: "grey.500",
              },
              borderRadius: "6px",
              padding: {
                xs: "8px 12px",
                sm: "8px 20px",
              },
              fontWeight: "500",
              textTransform: "none",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Reduce by {reduceMonths} Months
          </Button>
        </div>
      </Dialog>

      {/* Custom Update Modal */}
      <Dialog
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "6px",
          },
        }}
      >
        <DialogTitle>Custom Contract Update</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel>Contract Duration (Months)</InputLabel>
            <Select
              value={updateData.contractDurationMonths}
              onChange={(e) =>
                setUpdateData({
                  ...updateData,
                  contractDurationMonths: e.target.value,
                })
              }
              label="Contract Duration (Months)"
            >
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months (1 Year)</MenuItem>
              <MenuItem value={24}>24 Months (2 Years)</MenuItem>
              <MenuItem value={36}>36 Months (3 Years)</MenuItem>
              <MenuItem value={60}>60 Months (5 Years)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Grace Period (Days)</InputLabel>
            <Select
              value={updateData.gracePeriodDays}
              onChange={(e) =>
                setUpdateData({
                  ...updateData,
                  gracePeriodDays: e.target.value,
                })
              }
              label="Grace Period (Days)"
            >
              <MenuItem value={0}>0 Days (No Grace)</MenuItem>
              <MenuItem value={3}>3 Days</MenuItem>
              <MenuItem value={7}>7 Days (1 Week)</MenuItem>
              <MenuItem value={14}>14 Days (2 Weeks)</MenuItem>
              <MenuItem value={30}>30 Days (1 Month)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Contract Status</InputLabel>
            <Select
              value={updateData.contractStatus}
              onChange={(e) =>
                setUpdateData({ ...updateData, contractStatus: e.target.value })
              }
              label="Contract Status"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for update..."
          />
        </DialogContent>
        <div className="flex justify-end gap-4 px-6 pb-5">
          <Button
            style={{
              backgroundColor: "#ffffff", // Background color
              color: "#6b7280", // Text color
              borderRadius: "6px", // Rounded corners
              padding: "7px 16px", // Padding
              border: "1px solid #9ca3af", // Border style
              fontFamily: "Inter, sans-serif",
            }}
            onClick={() => setShowUpdateModal(false)}
          >
            Cancel
          </Button>
          <Button
            sx={{
              background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
              },
              "&:disabled": {
                backgroundColor: "grey.500",
              },
              borderRadius: "6px",
              padding: {
                xs: "8px 12px",
                sm: "8px 20px",
              },
              fontWeight: "500",
              textTransform: "none",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
              fontFamily: "Inter, sans-serif",
            }}
            variant="contained"
            onClick={handleUpdateContract}
          >
            Update Contract
          </Button>
        </div>
      </Dialog>

      {/* Renewal Approval Modal */}
      <Dialog
        open={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "6px",
          },
        }}
      >
        <DialogTitle>
          {/* <CheckCircle
            sx={{ mr: 1, verticalAlign: "middle", color: "#22c55e" }}
          /> */}
          Approve Renewal Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && selectedOrg && (
            <>
              <Alert
                severity=""
                sx={{
                  mb: 3,
                  backgroundColor: "#f9fafb",
                  border: "1px solid #f3f4f6",
                }}
              >
                <Typography variant="body2">
                  <strong>{selectedOrg.organizationName}</strong>
                  <br />
                  <strong>
                    {selectedRequest.requestedByName}
                  </strong> requested{" "}
                  <strong>
                    {selectedRequest.requestedDurationMonths} months
                  </strong>
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Message: "{selectedRequest.message || "No message"}"
                </Typography>
              </Alert>
              {approvalDuration !== selectedRequest.requestedDurationMonths && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ℹ️ You're approving for{" "}
                  <strong>{approvalDuration} months</strong> instead of the
                  requested{" "}
                  <strong>
                    {selectedRequest.requestedDurationMonths} months
                  </strong>
                </Alert>
              )}

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Approve For (Months)</InputLabel>
                <Select
                  value={approvalDuration}
                  onChange={(e) => setApprovalDuration(e.target.value)}
                  label="Approve For (Months)"
                >
                  <MenuItem value={3}>3 Months</MenuItem>
                  <MenuItem value={6}>6 Months</MenuItem>
                  <MenuItem value={12}>12 Months (1 Year)</MenuItem>
                  <MenuItem value={24}>24 Months (2 Years)</MenuItem>
                  <MenuItem value={36}>36 Months (3 Years)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Approval Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes for the admin..."
              />
            </>
          )}
        </DialogContent>
        <div className="flex justify-end gap-4 px-6 pb-5">
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
            onClick={() => setShowRenewalModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            sx={{
              background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
              },
              "&:disabled": {
                backgroundColor: "grey.500",
              },
              padding: "8px 30px",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
            }}
            onClick={() =>
              handleApproveRenewal(selectedOrg._id, selectedRequest._id)
            }
            disabled={!selectedOrg || !selectedRequest}
          >
            Approve for {approvalDuration} Months
          </Button>
        </div>
      </Dialog>
    </Box>
  );
};

export default ContractManagement;
