import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ClipboardList,
  RefreshCw as RefreshIcon,
  User,
  FileText,
  ToggleLeft,
  Hash,
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
import assessmentTypeService from "../../services/assessmentTypeService";
import CognitiveAssessmentdetails from "../requestAssessment/CognitiveAssessmentdetails";
import { AssessmentTypesManagement } from "../../DynamicData";

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

const AssessmentTypesMRT = () => {
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    agentId: "",
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
              fontWeight="medium"
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
        accessorKey: "agentId",
        header: "Agent ID",
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
              color: "#4b5563",
              fontSize: "14px",
            }}
          >
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
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
          //   <Typography
          //     variant="body2"
          //     sx={{
          //       overflow: "hidden",
          //       textOverflow: "ellipsis",
          //       whiteSpace: "nowrap",
          //       maxWidth: 200,
          //       fontWeight: "400",
          //       fontFamily: "Inter, sans-serif",
          //       color: "#4b5563",
          //       fontSize: "14px",
          //     }}
          //   >
          //     {cell.getValue() || "No description"}
          //   </Typography>

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
              {cell.getValue()}
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
              sx={{
                fontFamily: "Inter, sans-serif",
              }}
              size="small"
              variant="outlined"
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
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {/* <Tooltip title="Edit"> */}
            <IconButton
              sx={{
                width: 40,
                height: 40,
                border: "1px solid #D1D5DB", // Tailwind gray-300
                color: "#FFFFFF",
                borderRadius: "50%",
                backgroundColor: "#334155",
                "&:hover": {
                  backgroundColor: "#BAA377", // Button hover
                  color: "#ffffff",
                  borderColor: "#BAA377", // Button hover
                },
                transition: "all 0.15s ease-in-out",
              }}
              size="small"
              onClick={() => handleEdit(row.original)}
              color="primary"
            >
              <EditIcon size={16} />
            </IconButton>
            {/* </Tooltip> */}
            {/* <Tooltip title="Delete"> */}
            <IconButton
              sx={{
                width: 40,
                height: 40,
                border: "1px solid #D1D5DB", // Tailwind gray-300
                color: "#FFFFFF",
                borderRadius: "50%",
                backgroundColor: "#334155",
                "&:hover": {
                  backgroundColor: "#BAA377", // Button hover
                  color: "#ffffff",
                  borderColor: "#BAA377", // Button hover
                },
                transition: "all 0.15s ease-in-out",
              }}
              size="small"
              onClick={() => handleDelete(row.original._id)}
              color="error"
            >
              <Trash2 size={16} />
            </IconButton>
            {/* </Tooltip> */}
          </Box>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    []
  );

  const handlePaginationChange = (newPagination) => {
    loadAssessmentTypes(newPagination.currentPage);
  };

  // Load assessment types
  const loadAssessmentTypes = async (page = pagination.currentPage) => {
    setLoading(true);
    setError("");
    try {
      const response = await assessmentTypeService.getAllAssessmentTypes({
        page: page,
        limit: pagination.itemsPerPage,
      });
      if (response.assessmentTypes) {
        setAssessmentTypes(response.assessmentTypes);
        // Set pagination directly from server response (like Audit Logs)
        setPagination(response.pagination);
      }
    } catch (err) {
      setError("Failed to load assessment types");
      console.error("Error loading assessment types:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add new
  // const handleAdd = () => {
  //   setEditingType(null);
  //   setFormData({
  //     name: "",
  //     agentId: "",
  //     description: "",
  //     status: "active",
  //   });
  //   setShowModal(true);
  // };

  // Handle edit
  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      agentId: type.agentId,
      description: type.description,
      status: type.status,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await assessmentTypeService.deleteAssessmentType(id);
      setSuccess("Assessment type deleted successfully");
      loadAssessmentTypes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete assessment type");
      console.error("Error deleting assessment type:", err);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingType) {
        await assessmentTypeService.updateAssessmentType(
          editingType._id,
          formData
        );
        setSuccess("Assessment type updated successfully");
      } else {
        await assessmentTypeService.createAssessmentType(formData);
        setSuccess("Assessment type created successfully");
      }
      setShowModal(false);
      loadAssessmentTypes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save assessment type");
      console.error("Error saving assessment type:", err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAssessmentTypes();
  }, []);

  return (
    <div className="w-full ">
      {/* Header */}
      <div className="px-4">
        <CognitiveAssessmentdetails
          NewAssessment={AssessmentTypesManagement}
          customClassType={"AddedCustomCss"}
        />
      </div>

      {/* Success/Error Messages */}
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

      {/* Assessment Types Table */}
      <MaterialTableWithPagination
        columns={columns}
        data={assessmentTypes}
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
            color: "#BAA377",
          },
        }}
        renderTopToolbarCustomActions={({ table }) => (
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              p: "4px",
              flexWrap: "wrap",
            }}
          >
            <MRT_GlobalFilterTextField table={table} />
            <div className="flex justify-between gap-2 w-full   ">
              <div className="sm:block hidden border border-gray-400 rounded-lg">
                <MRT_ToggleFiltersButton table={table} />
              </div>
              <div className="flex justify-between gap-2  ">
                <Button
                  onClick={loadAssessmentTypes}
                  startIcon={<RefreshIcon className="sm:block hidden" style={{ color: "#ffffff" }} />}
                  variant="contained"
                  size="small"
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
                <Button
                  onClick={() => setShowModal(true)}
                  startIcon={<Plus className="sm:block hidden" />}
                  variant="contained"
                  size="small"
                  sx={{
                    background: "#334155",
                    "&:hover": {
                      background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
                    },
                    padding: { xs: "7px 16px", lg: "7px 24px", xl: "7px 24px" },
                    borderRadius: "6px",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
                  }}
                >
                  <span className="sm:hidden block text-xs">
                    Add Assessment
                  </span>
                  <span className="sm:block hidden">Add Assessment Type</span>
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
        aria-labelledby="assessment-type-modal"
      >
        <Box sx={modalStyle}>
          <Typography
            id="assessment-type-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 3 }}
          >
            {editingType ? "Edit Assessment Type" : "Add New Assessment Type"}
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
              label="Agent ID"
              value={formData.agentId}
              onChange={(e) =>
                setFormData({ ...formData, agentId: e.target.value })
              }
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Hash size={20} style={{ color: "#475569" }} />
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
                  backgroundColor: "#BAA377",
                  color: "#ffffff",
                  borderRadius: "6px",
                  fontWeight: "500",
                  padding: "7px 24px",
                  border: "1px solid #BAA377",
                  fontFamily: "Inter, sans-serif",
                }}
                variant="contained"
                onClick={() => setShowModal(false)}
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
                  padding: "7px 30px",
                  borderRadius: "6px",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 2px 8px rgba(49, 91, 242, 0.3)",
                }}
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {editingType ? "Update" : "Create"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default AssessmentTypesMRT;
