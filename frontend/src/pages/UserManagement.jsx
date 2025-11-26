import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  CheckCircle,
  Cancel,
  ToggleOff,
  ToggleOn,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as RoleIcon,
  Lock as PasswordIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import { EditIcon, UserPlus, XCircle } from "lucide-react";
import MaterialTableWithPagination from "../components/MaterialTableWithPagination";
import superAdminService from "../services/superAdminService";
import { useAuth } from "../contexts/AuthContext";
import styled from "@emotion/styled";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const UserManagement = () => {
  const { checkUserStatus } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [twoFactorUser, setTwoFactorUser] = useState(null);
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    twoFactorEnabled: false,
    hasSecret: false,
    backupCodesCount: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Clinic",
    organizationName: "",
    phone: "",
    isActive: true,
  });

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await superAdminService.getUsers();
      if (response.success) {
        setUsers(response.users || []);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (err) {
      setError("Failed to load users");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Handle add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await superAdminService.createUser(formData);
      if (response.success) {
        setSuccess("User created successfully!");
        await loadUsers();
        setShowAddModal(false);
        setFormData({
          name: "",
          email: "",
          role: "Clinic",
          organizationName: "",
          phone: "",
          isActive: true,
        });
      } else {
        setError(response.message || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to create user");
      console.error("Error creating user:", err);
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await superAdminService.updateUser(
        selectedUser._id,
        formData
      );
      if (response.success) {
        setSuccess("User updated successfully!");
        await loadUsers();
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({
          name: "",
          email: "",
          role: "Clinic",
          organizationName: "",
          phone: "",
          isActive: true,
        });
      } else {
        setError(response.message || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user");
      console.error("Error updating user:", err);
    }
  };

  // Handle toggle user status
  const handleToggleUserStatus = async (user) => {
    try {
      const response = await superAdminService.toggleUserStatus(user._id);
      if (response.success) {
        setSuccess(
          `User ${user.isActive ? "deactivated" : "activated"} successfully!`
        );
        await loadUsers();

        // Check if current user is still active after toggling
        // This will force logout if the current user was deactivated
        await checkUserStatus();
      } else {
        setError(response.message || "Failed to update user status");
      }
    } catch (err) {
      setError("Failed to update user status");
      console.error("Error updating user status:", err);
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "Clinic",
      organizationName: user.organizationName || "",
      phone: user.phone || "",
      isActive: user.isActive !== false,
    });
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Open 2FA modal
  const openTwoFactorModal = async (user) => {
    setTwoFactorUser(user);
    setShowTwoFactorModal(true);

    // Fetch current 2FA status
    try {
      const response = await superAdminService.getUserTwoFactorStatus(user._id);
      if (response.success) {
        setTwoFactorStatus(response);
      }
    } catch (err) {
      console.error("Error fetching 2FA status:", err);
      setError("Failed to fetch 2FA status");
    }
  };

  // Handle 2FA enable
  const handleEnableTwoFactor = async (password) => {
    if (!twoFactorUser) return;

    try {
      const response = await superAdminService.enableUserTwoFactor(
        twoFactorUser._id,
        { password }
      );
      if (response.success) {
        setSuccess("2FA enabled successfully");
        setTwoFactorStatus((prevStatus) => ({
          ...prevStatus,
          twoFactorEnabled: true,
          // Keep hasSecret and backupCodesCount as they are
        }));
        await loadUsers(); // Refresh user list
      } else {
        setError(response.message || "Failed to enable 2FA");
      }
    } catch (err) {
      setError("Failed to enable 2FA");
      console.error("Error enabling 2FA:", err);
    }
  };

  // Handle 2FA disable
  const handleDisableTwoFactor = async (password) => {
    if (!twoFactorUser) return;

    try {
      const response = await superAdminService.disableUserTwoFactor(
        twoFactorUser._id,
        { password }
      );
      if (response.success) {
        setSuccess("2FA disabled successfully");
        setTwoFactorStatus((prevStatus) => ({
          ...prevStatus,
          twoFactorEnabled: false,
          // Keep hasSecret and backupCodesCount as they are
        }));
        await loadUsers(); // Refresh user list
      } else {
        setError(response.message || "Failed to disable 2FA");
      }
    } catch (err) {
      setError("Failed to disable 2FA");
      console.error("Error disabling 2FA:", err);
    }
  };

  const GraySwitch = styled(Switch)(({ theme }) => ({
    width: 58,
    height: 26,
    padding: 0,
    display: "flex",
    "& .MuiSwitch-switchBase": {
      padding: "2px 0px 0px 4px",
      "&.Mui-checked": {
        transform: "translateX(28px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: "#334155", // button color when ON
          opacity: 1,
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      width: 22,
      height: 22,
      borderRadius: "50%",
      backgroundColor: "#fff",
    },
    "& .MuiSwitch-track": {
      borderRadius: 20,
      backgroundColor: "red", // light gray when OFF
      opacity: 1,
      position: "relative",
      transition: theme?.transitions?.create(["background-color"], {
        duration: 200,
      }),
      "&::before": {
        content: '"OFF"',
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
      },
    },
    "& .Mui-checked + .MuiSwitch-track::before": {
      content: '"ON"',
      left: 8,
    },
  }));

  // Define columns for Material React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "username",
        header: "User",
        size: 250,
        muiTableHeadCellProps: {
          sx: {
            position: {
              xs: "",
              sm: "sticky",
            },
            left: 0,
            zIndex: 2,
            background: "#f9fafb",
            paddingTop: "20px",
            paddingLeft: "32px",
            paddingBottom: "18px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            position: {
              xs: "",
              sm: "sticky",
            },
            left: 0,
            zIndex: 1,
            background: "white",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          },
        },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontWeight: "bold",
                border: "1px solid #E5E7EB",
                fontSize: "1rem",
              }}
            >
              {row.original.username?.charAt(0).toUpperCase() || "U"}
            </Box>
            <Box>
              <Typography
                variant="body2"
                fontWeight="medium"
                sx={{
                  fontWeight: "500",
                  fontFamily: "Inter, sans-serif",
                  color: "#111827",
                  fontSize: "14px",
                }}
              >
                {row.original?.username || "No Name"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: "500",
                  fontFamily: "Inter, sans-serif",
                  color: "#111827",
                  fontSize: "14px",
                }}
              >
                {row.original?.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 120,
        muiTableHeadCellProps: {
          sx: {
            textAlign: "center",
            paddingTop: "20px",
            background: "#f9fafb",
            paddingBottom: "18px",
            fontFamily: "Inter",
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            fontFamily: "Inter",
            fontWeight: 500,
            color: "#6B7280",
          },
        },
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            color={cell.getValue() === "SuperAdmin" ? "secondary" : "primary"}
            size="small"
            variant="outlined"
            sx={{
              fontFamily: "Inter, sans-serif",
            }}
          />
        ),
      },
      {
        accessorKey: "organizationName",
        header: "Organization",
        size: 150,
        muiTableHeadCellProps: {
          sx: {
            textAlign: "center",
            paddingTop: "20px",
            background: "#f9fafb",
            paddingBottom: "18px",
            fontFamily: "Inter",
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            fontFamily: "Inter",
            fontWeight: 500,
            color: "#6B7280",
          },
        },
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue() || "N/A"}
          </Typography>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        size: 120,
        muiTableHeadCellProps: {
          sx: {
            textAlign: "center",
            paddingTop: "20px",
            background: "#f9fafb",
            paddingBottom: "18px",
            fontFamily: "Inter",
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            fontFamily: "Inter",
            fontWeight: 500,
            color: "#6B7280",
          },
        },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={row.original.isActive ? "Active" : "Inactive"}
              color={row.original.isActive ? "success" : "error"}
              size="small"
              variant="outlined"
              icon={
                row.original.isActive ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <HighlightOffIcon style={{ width: 18, height: 18 }} />
                )
              }
            />

            <FormControlLabel
              control={
                <GraySwitch
                  checked={row.original.isActive}
                  onChange={() => handleToggleUserStatus(row?.original)}
                  inputProps={{
                    "aria-label": row.original.isActive
                      ? "Deactivate user"
                      : "Activate user",
                  }}
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>
        ),
      },
      {
        accessorKey: "twoFactorEnabled",
        header: "2FA",
        size: 100,
        muiTableHeadCellProps: {
          sx: {
            textAlign: "center",
            paddingTop: "20px",
            background: "#f9fafb",
            paddingBottom: "18px",
            fontFamily: "Inter",
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            fontFamily: "Inter",
            fontWeight: 500,
            color: "#6B7280",
          },
        },
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Chip
              label={row.original.twoFactorEnabled ? "Enabled" : "Disabled"}
              color={row.original.twoFactorEnabled ? "success" : "default"}
              size="small"
              variant="outlined"
              icon={<SecurityIcon style={{ width: 16, height: 16 }} />}
            />
            <IconButton
              size="small"
              onClick={() => openTwoFactorModal(row.original)}
              sx={{
                width: 32,
                height: 32,
                border: "1px solid #9ca3af",
                color: "#475569",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  borderColor: "#6b7280",
                },
                transition: "all 0.15s ease-in-out",
              }}
            >
              <SecurityIcon style={{ width: 16, height: 16 }} />
            </IconButton>
          </Box>
        ),
      },
      {
        accessorKey: "isVerified",
        header: "Verified",
        size: 100,
        muiTableHeadCellProps: {
          sx: {
            textAlign: "center",
            paddingTop: "20px",
            background: "#f9fafb",
            paddingBottom: "18px",
            fontFamily: "Inter",
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            fontFamily: "Inter",
            fontWeight: 500,
            color: "#6B7280",
          },
        },
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() ? "Verified" : "Pending"}
            color={cell.getValue() ? "success" : "warning"}
            size="small"
            variant="outlined"
            icon={
              cell.getValue() ? (
                <CheckCircleOutlineIcon />
              ) : (
                <XCircle style={{ width: 16, height: 16 }} />
              )
            }
          />
        ),
      },
      {
        accessorKey: "lastLogin",
        header: "Last Login",
        size: 120,
        muiTableHeadCellProps: {
          sx: {
            textAlign: "center",
            paddingTop: "20px",
            background: "#f9fafb",
            paddingBottom: "18px",
            fontFamily: "Inter",
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            fontFamily: "Inter",
            fontWeight: 500,
            color: "#6B7280",
          },
        },
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue()
              ? new Date(cell.getValue()).toLocaleString()
              : "Never"}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 120,
        muiTableHeadCellProps: {
          sx: {
            position: {
              xs: "",
              sm: "sticky",
            },
            right: 0,
            zIndex: 2,
            background: "#f9fafb",
            paddingTop: "20px",
            paddingBottom: "18px",
            fontFamily: "Inter",
            color: "#6B7280",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            position: {
              xs: "",
              sm: "sticky",
            },
            right: 0,
            zIndex: 1,
            background: "white",
          },
        },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => openViewModal(row.original)}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #D1D5DB",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  backgroundColor: "#334155",
                  "&:hover": {
                    backgroundColor: "#A8956A",
                    color: "#ffffff",
                    borderColor: "#A8956A",
                  },
                  transition: "all 0.15s ease-in-out",
                }}
              >
                <ViewIcon className="text-[18px]" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                onClick={() => openEditModal(row.original)}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #D1D5DB",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  backgroundColor: "#334155",
                  "&:hover": {
                    backgroundColor: "#A8956A",
                    color: "#ffffff",
                    borderColor: "#A8956A",
                  },
                  transition: "all 0.15s ease-in-out",
                }}
              >
                <EditIcon size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    []
  );

  useEffect(() => {
    loadUsers();

    const statusCheckInterval = setInterval(() => {
      checkUserStatus();
    }, 30000);

    return () => clearInterval(statusCheckInterval);
  }, [checkUserStatus]);

  return (
    <Box sx={{ p: 1 }}>
      <div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] mt-6  outline-1 outline-offset-[-1px] outline-white/40  mb-6">
          <div className="p-6  ">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                <div>
                  <h2 className="text-xl font-semibold text-gray-900  ">
                    User Management
                  </h2>
                  <p className="text-sm text-gray-600  ">
                    Manage users and their permissions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <div className="border border-gray-200 rounded-2xl">
        <MaterialTableWithPagination
          columns={columns}
          data={users}
          loading={loading}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: Math.max(
              1,
              Math.ceil(users.length / pagination.itemsPerPage)
            ),
            totalItems: users.length,
            itemsPerPage: pagination.itemsPerPage,
          }}
          onPaginationChange={handlePaginationChange}
          enablePagination={true}
          enableSorting={true}
          enableColumnFilters={true}
          enableGlobalFilter={true}
          enableRowSelection={false}
          enableColumnOrdering={false}
          enableColumnResizing={false}
          enableDensityToggle={true}
          enableFullScreenToggle={true}
          enableHiding={true}
          muiTableContainerProps={{
            sx: {
              maxHeight: "100vh",
            },
          }}
          muiCircularProgressProps={{
            sx: {
              color: "#BAA377",
            },
          }}
          muiTablePaperProps={{
            sx: {
              borderRadius: "16px",
            },
          }}
          renderTopToolbarCustomActions={({ table }) => (
            <Box
              sx={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <MRT_GlobalFilterTextField table={table} />
              <MRT_ToggleFiltersButton table={table} />
              <div className="flex gap-2 ml-auto  ">
                <Button
                  onClick={loadUsers}
                  startIcon={<RefreshIcon />}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#BAA377",
                    color: "#ffffff",
                    borderRadius: "6px",
                    borderColor: "#BAA377",
                    padding: "7px 16px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "500",
                    "&:hover": {
                      backgroundColor: "#A8956A",
                      borderColor: "#A8956A",
                      color: "#ffffff",
                    },
                    "&:disabled": {
                      backgroundColor: "#d1d5db",
                      color: "#9ca3af",
                      borderColor: "#d1d5db",
                      opacity: 0.6,
                    },
                  }}
                >
                  Refresh
                </Button>
                {/* <Button
                  onClick={() => setShowAddModal(true)}
                  startIcon={<AddIcon />}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#334155",
                    "&:hover": {
                      backgroundColor: "#A8956A",
                    },
                    borderRadius: "6px",
                    padding: "7px 20px",
                    fontWeight: "500",
                    textTransform: "none",
                    fontSize: "14px",
                    boxShadow: "none",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Add User
                </Button> */}
              </div>
            </Box>
          )}
        />
      </div>

      {/* Add User Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        aria-labelledby="add-user-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 400, sm: 500 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography
            id="add-user-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 3 }}
          >
            Add New User
          </Typography>
          <form onSubmit={handleAddUser}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: "#475569" }} />,
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: "#475569" }} />,
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                startAdornment={<RoleIcon sx={{ mr: 1, color: "#475569" }} />}
              >
                <MenuItem value="Clinic">Clinic</MenuItem>
                <MenuItem value="SuperAdmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Organization Name"
              value={formData.organizationName}
              onChange={(e) =>
                setFormData({ ...formData, organizationName: e.target.value })
              }
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <BusinessIcon sx={{ mr: 1, color: "#475569" }} />
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: "#475569" }} />,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active User"
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#BAA377",
                  color: "#ffffff",
                  borderRadius: "6px",
                  borderColor: "#BAA377",
                  padding: "7px 16px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "500",
                  "&:hover": {
                    backgroundColor: "#A8956A",
                    borderColor: "#A8956A",
                    color: "#ffffff",
                  },
                  "&:disabled": {
                    backgroundColor: "#d1d5db",
                    color: "#9ca3af",
                    borderColor: "#d1d5db",
                    opacity: 0.6,
                  },
                }}
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    email: "",
                    role: "Clinic",
                    organizationName: "",
                    phone: "",
                    isActive: true,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#334155",
                  "&:hover": {
                    backgroundColor: "#A8956A",
                  },
                  borderRadius: "6px",
                  fontWeight: "500",
                  textTransform: "none",
                  boxShadow: "none",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Create User
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        aria-labelledby="edit-user-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 400, sm: 500 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography
            id="edit-user-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 3 }}
          >
            Edit User
          </Typography>
          <form onSubmit={handleEditUser}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: "#475569" }} />,
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: "#475569" }} />,
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                startAdornment={<RoleIcon sx={{ mr: 1, color: "#475569" }} />}
              >
                <MenuItem value="Clinic">Clinic</MenuItem>
                <MenuItem value="SuperAdmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Organization Name"
              value={formData.organizationName}
              onChange={(e) =>
                setFormData({ ...formData, organizationName: e.target.value })
              }
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <BusinessIcon sx={{ mr: 1, color: "#475569" }} />
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: "#475569" }} />,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active User"
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#BAA377",
                  color: "#ffffff",
                  borderRadius: "6px",
                  borderColor: "#BAA377",
                  padding: "7px 16px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "500",
                  "&:hover": {
                    backgroundColor: "#A8956A",
                    borderColor: "#A8956A",
                    color: "#ffffff",
                  },
                  "&:disabled": {
                    backgroundColor: "#d1d5db",
                    color: "#9ca3af",
                    borderColor: "#d1d5db",
                    opacity: 0.6,
                  },
                }}
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setFormData({
                    name: "",
                    email: "",
                    role: "Clinic",
                    organizationName: "",
                    phone: "",
                    isActive: true,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#334155",
                  "&:hover": {
                    backgroundColor: "#A8956A",
                  },
                  borderRadius: "6px",
                  fontWeight: "500",
                  textTransform: "none",
                  boxShadow: "none",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Update User
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* View User Modal */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        aria-labelledby="view-user-modal"
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "90vw",
              md: "85vw",
              lg: "75vw",
              xl: "65vw",
            },
            maxWidth: "1400px",
            bgcolor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            p: {
              xs: 2,
              sm: 4,
            },
            borderRadius: 4,
            maxHeight: "95vh",
            overflow: "auto",
            border: "1px solid #e2e8f0",
          }}
        >
          <Box
            sx={{
              mb: 2,
              pb: 2,
              borderBottom: "2px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PersonIcon sx={{ color: "#475569", mr: 2, fontSize: 32 }} />
              <Typography
                id="view-user-modal"
                variant="h4"
                component="h2"
                sx={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.7rem" },
                }}
              >
                User Details
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Complete User Information
            </Typography>
          </Box>
          {selectedUser && (
            <Box sx={{ space: 2 }}>
              {/* Organization Details Section */}
              {selectedUser?.organization && (
                <>
                  {/* Organization Details Card */}
                  <Box
                    sx={{
                      mt: 3,
                      mb: 3,
                      p: 3,
                      bgcolor: "#f1f5f9",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#1e293b", fontWeight: 600 }}
                      >
                        Organization Details
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "1fr 1fr 1fr 1fr",
                        },
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <BusinessIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Organization Name
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.organizationName ||
                            "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <EmailIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Email Address
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.emailAddress || "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <PhoneIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Phone Number
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.phoneNumber || "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <BusinessIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Address
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.address || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Contract Information Card */}
                  <Box
                    sx={{
                      mt: 3,
                      mb: 3,
                      p: 3,
                      bgcolor: "#f1f5f9",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#1e293b", fontWeight: 600 }}
                      >
                        Contract Information
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "1fr 1fr 1fr",
                        },
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <BusinessIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Start Date
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.contractStartDate
                            ? new Date(
                                selectedUser?.organization?.contractStartDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <BusinessIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            End Date
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.contractEndDate
                            ? new Date(
                                selectedUser?.organization?.contractEndDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <BusinessIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Status
                          </Typography>
                        </Box>
                        <Chip
                          variant="outlined"
                          label={
                            selectedUser?.organization?.contractStatus || "N/A"
                          }
                          color={
                            selectedUser?.organization?.contractStatus ===
                            "Active"
                              ? "success"
                              : "default"
                          }
                          size="small"
                          sx={{
                            fontWeight: 500,
                            fontFamily: "Inter, sans-serif",
                            px: 1,
                            color:
                              selectedUser?.organization?.contractStatus ===
                              "Active"
                                ? "#0284c7"
                                : "#0284c7",
                            borderColor:
                              selectedUser?.organization?.contractStatus ===
                              "Active"
                                ? "#0284c7"
                                : "#0284c7",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Contact Person Details Card */}
                  <Box
                    sx={{
                      mt: 3,
                      mb: 3,
                      p: 3,
                      bgcolor: "#f1f5f9",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#1e293b", fontWeight: 600 }}
                      >
                        Contact Person Details
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "1fr 1fr 1fr",
                        },
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <PersonIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Contact Name
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.contactPersonName ||
                            "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <EmailIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Contact Email
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.contactPersonEmail ||
                            "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: "white",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <PhoneIcon
                            sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Contact Phone
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#1e293b" }}
                        >
                          {selectedUser?.organization?.contactPersonPhone ||
                            "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {/* Last Login Card */}
              <Box
                sx={{
                  mb: 3,
                  p: 3,
                  bgcolor: "#f1f5f9",
                  borderRadius: 2,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1e293b", fontWeight: 600 }}
                  >
                    Activity Information
                  </Typography>
                </Box>

                {/* Status Row */}
                <Box
                  sx={{
                    backgroundColor: "white",
                    p: 3,
                    mt: 2,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircle
                      sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                    />
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                    >
                      Email Verification
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedUser?.isVerified ? "Verified" : "Pending"}
                    color={selectedUser?.isVerified ? "success" : "warning"}
                    size="small"
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      px: 1,
                      color: selectedUser?.isVerified ? "#0284c7" : "#0284c7",
                      borderColor: selectedUser?.isVerified
                        ? "#0284c7"
                        : "#0284c7",
                    }}
                    variant="outlined"
                  />
                </Box>
                <Box
                  sx={{
                    backgroundColor: "white",
                    p: 3,
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0px 4px 20px 0px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CheckCircle
                      sx={{ color: "#0284c7", mr: 1, fontSize: 16 }}
                    />
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                    >
                      Last Login
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, color: "#1e293b" }}
                  >
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : "Never logged in"}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setShowViewModal(false)}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    borderColor: "#BAA377",
                    backgroundColor: "#BAA377",
                    color: "#ffffff",
                    "&:hover": {
                      borderColor: "#A8956A",
                      backgroundColor: "#A8956A",
                      color: "#ffffff",
                    },
                    "&:disabled": {
                      backgroundColor: "#d1d5db",
                      color: "#9ca3af",
                      borderColor: "#d1d5db",
                      opacity: 0.6,
                    },
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedUser);
                  }}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    backgroundColor: "#334155",
                    "&:hover": {
                      backgroundColor: "#A8956A",
                    },
                  }}
                >
                  Edit User
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* 2FA Management Modal */}
      <Modal
        open={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        aria-labelledby="2fa-management-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 400, sm: 500 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography
            id="2fa-management-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 3 }}
          >
            Two-Factor Authentication Management
          </Typography>

          {twoFactorUser && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>User:</strong>{" "}
                {twoFactorUser?.username || twoFactorUser?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Email:</strong> {twoFactorUser?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Role:</strong> {twoFactorUser?.role}
              </Typography>

              <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Current 2FA Status:
                </Typography>
                <Chip
                  label={
                    twoFactorStatus?.twoFactorEnabled ? "Enabled" : "Disabled"
                  }
                  color={
                    twoFactorStatus?.twoFactorEnabled ? "success" : "default"
                  }
                  size="small"
                  variant="outlined"
                  icon={<SecurityIcon />}
                  sx={{ mb: 1, px: 1 }}
                />
                {twoFactorStatus?.twoFactorEnabled && (
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    Backup codes available: {twoFactorStatus?.backupCodesCount}
                  </Typography>
                )}
              </Box>

              <div className="flex flex-wrap gap-2">
                {twoFactorStatus?.hasSecret ? (
                  // User has set up 2FA before - Show both Enable and Disable buttons
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SecurityIcon />}
                      onClick={() => handleEnableTwoFactor()}
                      disabled={twoFactorStatus?.twoFactorEnabled}
                      sx={{
                        backgroundColor: "#334155",

                        "&:hover": {
                          backgroundColor: "#A8956A",
                          color: "#ffffff",
                        },
                        "&:disabled": {
                          backgroundColor: "#d1d5db",
                          color: "#9ca3af",
                          opacity: 0.6,
                        },
                        padding: "7px 24px",
                        borderRadius: "6px",
                        fontFamily: "Inter, sans-serif",
                        color: "#ffffff",
                      }}
                    >
                      Enable 2FA
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      onClick={() => handleDisableTwoFactor()}
                      disabled={!twoFactorStatus?.twoFactorEnabled}
                      sx={{
                        backgroundColor: "#334155",
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
                        padding: "7px 24px",
                        borderRadius: "6px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Disable 2FA
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setShowTwoFactorModal(false)}
                      sx={{
                        backgroundColor: "#BAA377",
                        color: "#ffffff",
                        borderRadius: "6px",
                        borderColor: "#BAA377",
                        padding: "7px 16px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        "&:hover": {
                          backgroundColor: "#A8956A",
                          borderColor: "#A8956A",
                          color: "#ffffff",
                        },
                        "&:disabled": {
                          backgroundColor: "#d1d5db",
                          color: "#9ca3af",
                          borderColor: "#d1d5db",
                          opacity: 0.6,
                        },
                      }}
                    >
                      Close
                    </Button>
                  </>
                ) : (
                  // User has never set up 2FA - Show disabled button with message
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block", width: "100%" }}
                    >
                      ⚠️ User must set up 2FA themselves first. SuperAdmin can
                      only enable/disable existing 2FA.
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SecurityIcon />}
                      disabled
                      sx={{
                        backgroundColor: "#334155",

                        "&:hover": {
                          backgroundColor: "#334155",
                          color: "#ffffff",
                        },
                        "&:disabled": {
                          backgroundColor: "#d1d5db",
                          color: "#9ca3af",
                          opacity: 0.6,
                        },
                        padding: "7px 24px",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Enable 2FA
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setShowTwoFactorModal(false)}
                      sx={{
                        backgroundColor: "#BAA377",
                        color: "#ffffff",
                        borderRadius: "6px",
                        borderColor: "#BAA377",
                        padding: "7px 16px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        "&:hover": {
                          backgroundColor: "#A8956A",
                          borderColor: "#A8956A",
                          color: "#ffffff",
                        },
                        "&:disabled": {
                          backgroundColor: "#d1d5db",
                          color: "#9ca3af",
                          borderColor: "#d1d5db",
                          opacity: 0.6,
                        },
                      }}
                    >
                      Close
                    </Button>
                  </>
                )}
              </div>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default UserManagement;
