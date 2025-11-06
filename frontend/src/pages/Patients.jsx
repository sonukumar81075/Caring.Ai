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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MaterialReactTable } from "material-react-table";
import { useAuth } from "../contexts/AuthContext";
import PatientFormModal from "../components/PatientFormModal";
import MaterialTableWithPagination from "../components/MaterialTableWithPagination";
import {
  apiCreatePatient,
  apiDeletePatient,
  apiFetchPatients,
  apiUpdatePatient,
  apiReactivatePatient,
  apiExportPatients,
} from "../mock-api";
import CognitiveAssessmentdetails from "../components/requestAssessment/CognitiveAssessmentdetails";
import { PatientManagement } from "../DynamicData";
import { FiUserCheck, FiUserX } from "react-icons/fi";
import { EditIcon } from "lucide-react";

const Patients = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [serverOnline, setServerOnline] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  const fetchPatients = async (
    page = pagination.currentPage,
    search = searchTerm,
    status = statusFilter
  ) => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("Please log in to access patient data.");
      setPatients([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        search,
        status,
      };
      const response = await apiFetchPatients(params);
      setPatients(response.data || []);
      setPagination((prev) => ({
        ...prev,
        currentPage: response.pagination?.currentPage || page,
        totalItems: response.pagination?.totalPatients || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
      setServerOnline(true);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : err.message.includes("Authentication required")
        ? "Please log in to access patient data."
        : `Failed to fetch patients data: ${err.message}`;
      setError(errorMessage);
      setServerOnline(false);
      console.error("Error fetching patients:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPatients();
    }
  }, [isAuthenticated, authLoading]);

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleFormSubmit = async (formData) => {
    setError(null);
    try {
      if (editingPatient) {
        await apiUpdatePatient(editingPatient.id, formData);
      } else {
        // CREATE operation
        await apiCreatePatient(formData);
      }
      fetchPatients();
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to ${editingPatient ? "update" : "add"} patient: ${
            err.message
          }`;
      setError(errorMessage);
      console.error("Error in form submit:", err);
    }
  };

  // --- D E L E T E (API Call) ---
  const handleDeletePatient = async (patientId) => {
    setError(null);
    try {
      await apiDeletePatient(patientId);
      fetchPatients();
      setSuccess("Patient deactivated successfully.");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to deactivate patient: ${err.message}`;
      setError(errorMessage);
      setSuccess(null);
      console.error("Error deactivating patient:", err);
    }
  };

  const handleReactivatePatient = async (patientId) => {
    setError(null);
    try {
      await apiReactivatePatient(patientId);
      fetchPatients(); // Refresh table data
      setSuccess("Patient reactivated successfully.");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to reactivate patient: ${err.message}`;
      setError(errorMessage);

      console.error("Error reactivating patient:", err);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // Debounce search - fetch after 500ms of no typing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchPatients(1, event.target.value, statusFilter);
    }, 500);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    fetchPatients(1, searchTerm, event.target.value);
  };

  const handlePageChange = (newPagination) => {
    fetchPatients(newPagination.currentPage, searchTerm, statusFilter);
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

      const response = await apiExportPatients(params);

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
      link.download = `patients_export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Unable to connect to server. Please ensure the backend server is running."
        : `Failed to export patients: ${err.message}`;
      setError(errorMessage);
      console.error("Error exporting patients:", err);
    }
  };

  const handleRefresh = () => {
    fetchPatients(pagination.currentPage, searchTerm, statusFilter);
  };

  // Define the table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "patientId",
        header: "Patient ID",
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
        header: "Patient Name",
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
        accessorKey: "contactNo",
        header: "Contact Number",
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
        accessorKey: "age",
        header: "Age",
        size: 80,
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
            {cell.getValue()} years
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
                title="Edit patient information"
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
                  onClick={() => handleDeletePatient(row.original.id)}
                  title="Deactivate patient"
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
                  onClick={() => handleReactivatePatient(row.original.id)}
                  title="Reactivate patient"
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
                  <FiUserCheck className="text-[18px]" />
                </IconButton>
              )}
            </Box>
          );
        },
      },
    ],
    [patients]
  );

  return (
    <Box>
      <CognitiveAssessmentdetails NewAssessment={PatientManagement} />
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
      <div className="border border-gray-200 rounded-xl    mb-6">
        <Paper elevation={1} sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
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
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {/* 1. Search TextField */}
              <TextField
                size="small"
                placeholder="Search by name, email, contact, or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 250,
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    fontFamily: "Inter, sans-serif",
                    borderRadius: "6px",
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
                size="small"
                sx={{
                  minWidth: 150,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    fontFamily: "Inter, sans-serif",
                    color: "#475569",
                    "& fieldset": {
                      borderColor: "#d1d1d1", // default gray border
                      color: "#475569",
                    },
                    "&:hover fieldset": {
                      borderColor: "#a8a8a8", // slightly darker gray on hover
                      color: "#475569",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#d1d1d1", // keep gray on focus instead of blue
                      color: "#475569",
                      boxShadow: "none",
                    },
                  },
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                }}
              >
                <InputLabel id="status-label" shrink>
                  Status
                </InputLabel>
                <Select
                  labelId="status-label"
                  id="status-select"
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
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
                size="small"
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
                REFRESH
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={
                  <FileDownloadIcon className="text-gray-500 text-[12px]" />
                }
                onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                disabled={!serverOnline || !isAuthenticated}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  borderRadius: "6px",
                  padding: "7px 20px",
                  border: "1px solid #9ca3af",
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
                Add New Patient
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
        </Paper>
        {/* Material React Table */}
        {authLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Checking authentication...</Typography>
          </Box>
        ) : (
          <>
            <MaterialTableWithPagination
              columns={columns}
              data={patients}
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
            />
          </>
        )}
      </div>

      {/* The Add/Edit Patient Modal */}
      <PatientFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        editingPatient={editingPatient}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};

export default Patients;
