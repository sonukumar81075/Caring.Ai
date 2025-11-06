import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Globe,
  RefreshCwIcon,
  User,
  FileText,
  ToggleLeft,
  EditIcon,
} from "lucide-react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  MaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import MaterialTableWithPagination from "../MaterialTableWithPagination";
import ethnicityService from "../../services/ethnicityService";
import { EthnicitiesManagement } from "../../DynamicData";
import CognitiveAssessmentdetails from "../requestAssessment/CognitiveAssessmentdetails";

// Material-UI Modal style
const modalStyle = {
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

const EthnicitiesMRT = () => {
  const [ethnicities, setEthnicities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEthnicity, setEditingEthnicity] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  // Define columns for Material React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight="medium "
              sx={{
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                color: "#4b5563",
                fontSize: "14px",
              }}
            >
              {cell.getValue()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 300,
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
          <Tooltip title={cell.getValue()} arrow>
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 300,
                fontWeight: "400",
                fontFamily: "Inter, sans-serif",
                color: "#4b5563",
                fontSize: "14px",
              }}
            >
              {cell.getValue() || "No description"}
            </Typography>
          </Tooltip>
        ),
      },
      {
        accessorKey: "status",
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
        Cell: ({ cell }) => {
          const status = cell.getValue();
          return (
            <Chip
              label={status}
              color={status === "active" ? "success" : "default"}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: "Inter, sans-serif",
              }}
            />
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
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
            color="text.secondary"
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#4b5563",
              fontSize: "14px",
            }}
          >
            {new Date(cell.getValue()).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 120,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
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
              size="small"
              onClick={() => handleEdit(row.original)}
              color="primary"
            >
              <EditIcon size={16} />
            </IconButton>
            <IconButton
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
              size="small"
              onClick={() => handleDelete(row.original?._id)}
              color="error"
            >
              <Trash2 size={16} />
            </IconButton>
          </Box>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    []
  );

  const handlePaginationChange = (newPagination) => {
    loadEthnicities(newPagination.currentPage);
  };

  // Load ethnicities
  const loadEthnicities = async (page = pagination.currentPage) => {
    setLoading(true);
    setError("");
    try {
      const response = await ethnicityService.getAllEthnicities({
        page: page,
        limit: pagination.itemsPerPage,
      });
      if (response.ethnicities) {
        setEthnicities(response.ethnicities);
        // Set pagination directly from server response (like Audit Logs)
        setPagination(response.pagination);
      }
    } catch (err) {
      setError("Failed to load ethnicities");
      console.error("Error loading ethnicities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEthnicity(null);
    setFormData({
      name: "",
      description: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (ethnicity) => {
    setEditingEthnicity(ethnicity);
    setFormData({
      name: ethnicity.name,
      description: ethnicity.description,
      status: ethnicity.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => { 
    try {
      await ethnicityService.deleteEthnicity(id);
      setSuccess("Ethnicity deleted successfully");
      loadEthnicities();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete ethnicity");
      console.error("Error deleting ethnicity:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingEthnicity) {
        await ethnicityService.updateEthnicity(editingEthnicity._id, formData);
        setSuccess("Ethnicity updated successfully");
      } else {
        await ethnicityService.createEthnicity(formData);
        setSuccess("Ethnicity created successfully");
      }
      setShowModal(false);
      loadEthnicities();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save ethnicity");
      console.error("Error saving ethnicity:", err);
    }
  };

  useEffect(() => {
    loadEthnicities();
  }, []);

  return (
    <div className="w-full">
      <div className="px-4">
        <CognitiveAssessmentdetails
          NewAssessment={EthnicitiesManagement}
          customClassType={"AddedCustomCss"}
        />
      </div>

      <div className="px-4">
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2, mt: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, mt: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}
      </div>

      <MaterialTableWithPagination
        columns={columns}
        data={ethnicities}
        loading={loading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        enablePagination={true}
        serverSidePagination={true}
        enableSorting={true}
        enableColumnFilters={true}
        enableTopToolbar={true}
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
            color: "#9ca3af",
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
            <div className="flex justify-between items-center w-full px-1">
              <div className="sm:block hidden border border-gray-400 rounded-lg ">
                <MRT_ToggleFiltersButton table={table} />
              </div>

              <div className="flex gap-2  ">
                <Button
                  onClick={loadEthnicities}
                  startIcon={
                    <RefreshCwIcon className="sm:block hidden" size={16} />
                  }
                  variant="outlined"
                  size="small"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    borderRadius: "6px",
                    fontWeight: "500",
                    padding: "7px 24px",
                    border: "1px solid #9ca3af",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Refresh
                </Button>
                <Button
                  onClick={handleAdd}
                  startIcon={<Plus className="sm:block hidden" size={16} />}
                  variant="contained"
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
                    },
                    padding: "7px 24px",
                    borderRadius: "6px",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
                  }}
                >
                  Add Ethnicity
                </Button>
              </div>
            </div>
          </Box>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="ethnicity-modal"
      >
        <Box sx={modalStyle}>
          <Typography
            id="ethnicity-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 3 }}
          >
            {editingEthnicity ? "Edit Ethnicity" : "Add New Ethnicity"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} style={{ color: "#475569" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FileText size={20} style={{ color: "#475569" }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                startAdornment={
                  <InputAdornment position="start">
                    <ToggleLeft size={20} style={{ color: "#475569" }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
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
                variant="outlined"
                onClick={() => setShowModal(false)}
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
                  padding: {
                    xs: "7px 10px",
                    sm: "7px 24px",
                  },
                  borderRadius: "6px",
                  fontSize: {
                    xs: "10px",
                    sm: "0.875rem",
                  },
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 2px 8px rgba(49, 91, 242, 0.3)",
                }}
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {editingEthnicity ? "Update" : "Create"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default EthnicitiesMRT;
