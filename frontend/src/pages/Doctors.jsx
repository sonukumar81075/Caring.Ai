import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MaterialReactTable } from "material-react-table";
import { useAuth } from "../contexts/AuthContext";
import DoctorFormModal from "../components/DoctorFormModal";
import MaterialTableWithPagination from "../components/MaterialTableWithPagination";
import { DoctorManagement } from "../DynamicData";
import {
  apiCreateDoctor,
  apiDeleteDoctor,
  apiFetchDoctors,
  apiUpdateDoctor,
  apiReactivateDoctor,
  apiExportDoctors,
} from "../mock-api";
import CognitiveAssessmentdetails from "../components/requestAssessment/CognitiveAssessmentdetails";
import { FiUserCheck, FiUserX } from "react-icons/fi";
import { EditIcon } from "lucide-react";

const Doctors = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null); // null for Add, doctor object for Edit
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [serverOnline, setServerOnline] = useState(true);

  // Pagination and filtering states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // Fetch doctors from API
  const fetchDoctors = async (
    page = pagination.currentPage,
    search = searchTerm,
    status = statusFilter
  ) => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("Please log in to access doctor data.");
      setDoctors([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: pagination.itemsPerPage,
        search,
        status,
      };
      const response = await apiFetchDoctors(params);
      setDoctors(response.data || []);
      setPagination((prev) => ({
        ...prev,
        currentPage: response.pagination?.currentPage || page,
        totalItems: response.pagination?.totalDoctors || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
      setServerOnline(true);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to fetch doctors: ${err.message}`;
      setError(errorMessage);
      setDoctors([]);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // Load doctors on component mount and when authentication changes
  useEffect(() => {
    if (!authLoading) {
      fetchDoctors();
    }
  }, [isAuthenticated, authLoading]);

  // Modal handlers
  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  // Form submission handler
  const handleFormSubmit = async (formData) => {
    setError(null);
    setSuccess(null);
    try {
      if (editingDoctor) {
        // UPDATE operation - pass the doctor ID
        await apiUpdateDoctor(editingDoctor.id, formData);
        setSuccess("Doctor updated successfully!");
      } else {
        // CREATE operation
        await apiCreateDoctor(formData);
        setSuccess(
          "Doctor created successfully! A user account has been created and login credentials have been sent to the doctor's email."
        );
      }
      fetchDoctors(); // Refresh table data
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to ${editingDoctor ? "update" : "add"} doctor: ${
            err.message
          }`;
      setError(errorMessage);
      console.error("Error in form submit:", err);
    }
  };

  // Delete doctor handler
  const handleDeleteDoctor = async (doctorId) => {
    try {
      await apiDeleteDoctor(doctorId);
      fetchDoctors(); // Refresh table data
      setSuccess("Doctor deactivating successfully! ");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to deactivate doctor: ${err.message}`;
      setError(errorMessage);
      console.error("Error deactivating doctor:", err);
    }
  };

  const handleReactivateDoctor = async (doctorId) => {
    setError(null);
    try {
      await apiReactivateDoctor(doctorId);
      fetchDoctors(); // Refresh table data
      setSuccess("Doctor reactivated successfully! ");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to reactivate doctor: ${err.message}`;
      setError(errorMessage);
      console.error("Error reactivating doctor:", err);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // Debounce search - fetch after 500ms of no typing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchDoctors(1, event.target.value, statusFilter);
    }, 500);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    fetchDoctors(1, searchTerm, event.target.value);
  };

  const handlePageChange = (newPagination) => {
    fetchDoctors(newPagination.currentPage, searchTerm, statusFilter);
  };

  const handleExport = async (format) => {
    setExportMenuAnchor(null);
    setError(null);
    try {
      // Ensure searchTerm is a string, not a function
      const safeSearchTerm = typeof searchTerm === "string" ? searchTerm : "";
      const safeStatusFilter =
        typeof statusFilter === "string" ? statusFilter : "Active";

      const params = {
        format,
        search: safeSearchTerm,
        status: safeStatusFilter,
      };

      const response = await apiExportDoctors(params);

      // Handle different response types
      let exportData;
      let mimeType;

      if (format === "csv") {
        // CSV response is a string
        exportData = response;
        mimeType = "text/csv";
      } else {
        // JSON response is an object, stringify it
        exportData =
          typeof response === "string"
            ? response
            : JSON.stringify(response, null, 2);
        mimeType = "application/json";
      }

      // Create download link
      const blob = new Blob([exportData], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `doctors_export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to export doctors: ${err.message}`;
      setError(errorMessage);
      console.error("Error exporting doctors:", err);
    }
  };

  const handleRefresh = () => {
    fetchDoctors(pagination.currentPage, searchTerm, statusFilter);
  };

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "doctorId",
        header: "Doctor ID",
        size: 120,
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
            paddingBottom: "18px",
            fontFamily: "Inter, sans-serif", // Ensure fallback
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
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "name",
        header: "Doctor Name",
        size: 200,
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
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "email",
        header: "Email Address",
        size: 250,
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
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
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
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "specialty",
        header: "Specialty",
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
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
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
        Cell: ({ cell }) => {
          const status = cell.getValue();
          return (
            <Chip
              sx={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "12px",
                height: "24px",
                padding: "0 10px",
              }}
              label={status}
              color={status === "Active" ? "success" : "error"}
              size="small"
              variant="outlined"
            />
          );
        },
      },
      {
        // Custom Action Column
        id: "actions",
        header: "Actions",
        size: 160,
        muiTableHeadCellProps: {
          sx: {
            position: { xs: "static", md: "sticky" },
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
            position: { xs: "static", md: "sticky" },
            right: 0,
            zIndex: 1,
            background: "white",
          },
        },
        Cell: ({ row }) => {
          const isActive = row.original.status === "Active";
          return (
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <IconButton
                onClick={() => handleOpenEdit(row.original)}
                title="Edit doctor information"
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #D1D5DB", // Tailwind gray-300
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  backgroundColor: "#BAA377",
                  "&:hover": {
                    backgroundColor: "#A8956A", // Button hover
                    color: "#ffffff",
                    borderColor: "#A8956A", // Button hover
                  },
                  transition: "all 0.15s ease-in-out",
                }}
              >
                <EditIcon size={18} />{" "}
              </IconButton>

              {isActive ? (
                <IconButton
                  onClick={() => handleDeleteDoctor(row.original.id)}
                  title="Deactivate doctor"
                  sx={{
                    width: 40,
                    height: 40,
                    border: "1px solid #D1D5DB", // Tailwind gray-300
                    color: "#FFFFFF",
                    borderRadius: "50%",
                    backgroundColor: "#BAA377",
                    "&:hover": {
                      backgroundColor: "#A8956A", // Button hover
                      color: "#ffffff",
                      borderColor: "#A8956A", // Button hover
                    },
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  <FiUserX className="text-[18px]" />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => handleReactivateDoctor(row.original.id)}
                  title="Reactivate doctor"
                  sx={{
                    width: 40,
                    height: 40,
                    border: "1px solid #D1D5DB",
                    color: "#FFFFFF",
                    borderRadius: "50%",
                    backgroundColor: "#BAA377",
                    "&:hover": {
                      backgroundColor: "#A8956A",
                      color: "#ffffff",
                      borderColor: "#A8956A",
                    },
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  <FiUserCheck className="text-[18px]" />
                </IconButton>
              )}
            </Box>
          );
        },
      },
    ],
    [doctors]
  );

  return (
    <Box>
      <CognitiveAssessmentdetails NewAssessment={DoctorManagement} />
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

      <div className="border border-gray-200 rounded-xl   bg-white  mb-6">
        <Paper elevation={1} sx={{ p: 3 }}>
          {/* Loading State */}
          {authLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading authentication...
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
                borderRadius: "0 !important",
              }}
            >
              <TextField
                placeholder="Search by name, email, phone, specialty, or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 250,
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    fontFamily: "Inter, sans-serif",
                    "& fieldset": {
                      borderColor: "#d1d1d1", // default gray border
                    },
                    "&:hover fieldset": {
                      borderColor: "#a8a8a8", // slightly darker gray on hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#d1d1d1", // keep gray on focus instead of blue
                      boxShadow: "none",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl
                sx={{
                  width: {
                    xs: "100%",
                    sm: 150,
                  },
                  fontFamily: "Inter, sans-serif",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    color: "#475569",
                    "& fieldset": {
                      borderColor: "#d1d1d1",
                      color: "#475569",
                    },
                    "&:hover fieldset": {
                      borderColor: "#a8a8a8",
                      color: "#475569",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#d1d1d1",
                      color: "#475569",
                      boxShadow: "none",
                    },
                  },
                }}
                size="small"
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#333",
                    borderRadius: "6px",
                    padding: "0px 16px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="All">All</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={!serverOnline || !isAuthenticated}
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  borderRadius: "6px",
                  borderColor: "#9ca3af",
                  padding: "7px 16px",
                  fontFamily: "Inter, sans-serif",
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                }}
              >
                Refresh
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon className="text-gray-500" />}
                onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                disabled={!serverOnline || !isAuthenticated}
                style={{
                  backgroundColor: "#ffffff", // Background color
                  color: "#333", // Text color
                  borderRadius: "6px", // Rounded corners
                  padding: "7px 16px", // Padding
                  border: "1px solid #9ca3af", // Border style
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Export
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                disabled={!serverOnline || !isAuthenticated}
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
                    xs: "7px 12px",
                    sm: "7px 20px",
                  },
                  fontWeight: "500",
                  textTransform: "none",
                  fontSize: "14px",
                  boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Add New Doctor
              </Button>
            </Box>
          </Box>
          {/* Export Menu */}
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleExport("csv")}>
              <ListItemIcon>
                <FileDownloadIcon />
              </ListItemIcon>
              <ListItemText>Export as CSV</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport("json")}>
              <ListItemIcon>
                <FileDownloadIcon />
              </ListItemIcon>
              <ListItemText>Export as JSON</ListItemText>
            </MenuItem>
          </Menu>
          {/* Doctors Table */}
        </Paper>
        {isAuthenticated && (
          <>
            <MaterialTableWithPagination
              columns={columns}
              data={doctors}
              loading={loading}
              pagination={pagination}
              onPaginationChange={handlePageChange}
              enablePagination={true}
              serverSidePagination={true}
              enableSorting={true}
              enableTopToolbar={false}
              enableColumnFilters={false}
              enableGlobalFilter={false}
              enableRowSelection={false}
              enableColumnOrdering={false}
              enableColumnResizing={false}
              enableDensityToggle={false}
              enableFullScreenToggle={false}
              enableHiding={false}
              muiTableContainerProps={{
                sx: {
                  maxHeight: "100vh",
                },
              }}
              renderEmptyRowsFallback={() => (
                <Typography
                  variant="body2"
                  sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
                >
                  {loading
                    ? "Loading doctors..."
                    : 'No doctors found. Click "Add New Doctor" to get started.'}
                </Typography>
              )}
            />
          </>
        )}
      </div>

      <DoctorFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        editingDoctor={editingDoctor}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};

export default Doctors;
