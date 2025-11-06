import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import { TfiControlSkipBackward } from "react-icons/tfi";

import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  MedicalServices as MedicalIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  AccessTime as ClockIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import requestAssessmentService from "../services/requestAssessmentService";
import { BookingQueueCards } from "../components/comman/BookingQueueCards";
import CognitiveAssessmentdetails from "../components/requestAssessment/CognitiveAssessmentdetails";
import { BookingQueueManagement } from "../DynamicData";
import { IoChevronBackOutline } from "react-icons/io5";
import { GrFormNext } from "react-icons/gr";
import { RxTrackNext } from "react-icons/rx";
import { MdSkipNext } from "react-icons/md";
import { RiSkipBackMiniFill } from "react-icons/ri";
import { IoChevronBack } from "react-icons/io5";

// --- Custom Pagination Component ---

const CustomTablePagination = ({ currentPage, totalPages, loadPage }) => {
  if (totalPages <= 1) return null;

  const controlButtonStyles = {
    minWidth: 32,
    height: 32,
    padding: 0,
    borderRadius: "50%",
    border: "1px solid #9ca3af",
    color: "#111827",
    backgroundColor: "#F3F4F6",
    fontSize: "14px",
    fontWeight: 500,
    "&:hover": {
      backgroundColor: "#F3F4F6",
    },
    margin: "0 4px",
  };

  const activePageButtonStyles = {
    ...controlButtonStyles,
    backgroundColor: "#BAA377",
    color: "white",
    borderColor: "#BAA377",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#A8956A",
    },
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) end = Math.min(totalPages, 3);
    if (currentPage === totalPages) start = Math.max(1, totalPages - 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ensure page 1 is shown
    if (!pages.includes(1) && totalPages > 1) {
      pages.unshift(1);
      if (pages[1] !== 2) pages.splice(1, 0, "...");
    }

    // Ensure last page is shown
    if (!pages.includes(totalPages) && totalPages > 1) {
      if (pages[pages.length - 1] !== totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return Array.from(
      new Set(pages.filter((p, i, a) => p !== "..." || a[i + 1] !== "..."))
    );
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 0",
        backgroundColor: "#e5e7eb",
        borderBottomLeftRadius: 16,
        border: "none",
        borderBottomRightRadius: 16,
        width: "100%",
      }}
    >
      <Button
        onClick={() => loadPage(1)}
        disabled={currentPage === 1}
        sx={controlButtonStyles}
      >
        <RiSkipBackMiniFill className="text-lg" />
      </Button>
      <Button
        onClick={() => loadPage(currentPage - 1)}
        disabled={currentPage === 1}
        sx={controlButtonStyles}
      >
        <IoChevronBack className="text-lg" />
      </Button>

      {/* Render Page Buttons */}
      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <Typography key={index} sx={{ margin: "0 4px", color: "#6B7280" }}>
            ...
          </Typography>
        ) : (
          <Button
            key={page}
            onClick={() => loadPage(page)}
            sx={
              page === currentPage
                ? activePageButtonStyles
                : controlButtonStyles
            }
          >
            {page}
          </Button>
        )
      )}

      <Button
        onClick={() => loadPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        sx={controlButtonStyles}
      >
        <GrFormNext className="text-lg" />
      </Button>
      <Button
        onClick={() => loadPage(totalPages)}
        disabled={currentPage === totalPages}
        sx={controlButtonStyles}
      >
        <MdSkipNext className="text-lg" />
      </Button>
    </Box>
  );
};

// --- Main Component ---

const BookingQueue = () => {
  const [requestAssessments, setRequestAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    patientName: "",
    assessmentType: "",
    startDate: "",
    endDate: "",
  });

  // Statistics
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedRequests: 0,
  });

  // Load request assessments (for table display)
  const loadRequestAssessments = async (
    page = pagination.currentPage,
    customFilters = null
  ) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use customFilters if provided, otherwise use current filters state
      const activeFilters = customFilters !== null ? customFilters : filters;

      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...(activeFilters.search && { search: activeFilters.search }),
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.patientName && {
          patientName: activeFilters.patientName,
        }),
        ...(activeFilters.assessmentType && {
          assessmentType: activeFilters.assessmentType,
        }),
        ...(activeFilters.startDate && { startDate: activeFilters.startDate }),
        ...(activeFilters.endDate && { endDate: activeFilters.endDate }),
      };

      const response = await requestAssessmentService.getRequestAssessments(
        params
      );

      if (response.success) {
        setRequestAssessments(response.data);
        setPagination((prev) => ({
          ...response.pagination,
          itemsPerPage: prev.itemsPerPage,
        }));
      } else {
        setError(response.message || "Failed to load assessment requests");
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load assessment requests"
      );
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Load request assessments with specific search value (for debounced search)
  const loadRequestAssessmentsWithSearch = async (
    page = pagination.currentPage,
    searchValue = "",
    customFilters = null
  ) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use customFilters if provided, otherwise use current filters state
      const activeFilters = customFilters !== null ? customFilters : filters;

      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...(searchValue && { search: searchValue }),
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.patientName && {
          patientName: activeFilters.patientName,
        }),
        ...(activeFilters.assessmentType && {
          assessmentType: activeFilters.assessmentType,
        }),
        ...(activeFilters.startDate && { startDate: activeFilters.startDate }),
        ...(activeFilters.endDate && { endDate: activeFilters.endDate }),
      };

      const response = await requestAssessmentService.getRequestAssessments(
        params
      );

      if (response.success) {
        setRequestAssessments(response.data);
        setPagination((prev) => ({
          ...response.pagination,
          itemsPerPage: prev.itemsPerPage,
        }));
      } else {
        setError(response.message || "Failed to load assessment requests");
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load assessment requests"
      );
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to change page
  const loadPage = (page) => {
    if (page < 1 || page > pagination?.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
    // Use current filters when changing pages
    setFilters((currentFilters) => {
      loadRequestAssessments(page, currentFilters);
      return currentFilters;
    });
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response =
        await requestAssessmentService.getRequestAssessmentStats();

      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    console.log("value", value);
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle search change with debouncing (like Patient/Doctor management)
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        search: value,
      };

      // Debounce search - fetch after 500ms of no typing
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        loadRequestAssessmentsWithSearch(1, value, updatedFilters);
      }, 500);

      return updatedFilters;
    });
  };

  // Apply filters
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    // Access the latest filters state using functional update
    // This ensures we get the most recent filter values even if state update is pending
    setFilters((currentFilters) => {
      // Load data with the current filters immediately
      loadRequestAssessments(1, currentFilters);
      loadStats();
      // Return unchanged to avoid unnecessary re-render
      return currentFilters;
    });
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      status: "",
      patientName: "",
      assessmentType: "",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadRequestAssessments(1, clearedFilters);
    loadStats();
  };

  // Handle status update (omitted for brevity)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response =
        await requestAssessmentService.updateRequestAssessmentStatus(
          id,
          newStatus
        );

      if (response.success) {
        setSuccess(`Assessment request ${newStatus} successfully`);
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
        // Use current filters when reloading after status update
        setFilters((currentFilters) => {
          loadRequestAssessments(pagination.currentPage, currentFilters);
          return currentFilters;
        });
        loadStats();
      } else {
        setError(response.message || "Failed to update status");
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Export functionality - MODIFIED TO FETCH ALL DATA
  const handleExport = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    let dataToExport = [];

    try {
      // 1. Fetch ALL data using the current filters, but with a large limit (or API specific 'export' logic)
      const exportParams = {
        page: 1,
        limit: 99999, // Assuming a large limit is sufficient to fetch all or use a dedicated export endpoint
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.patientName && { patientName: filters.patientName }),
        ...(filters.assessmentType && {
          assessmentType: filters.assessmentType,
        }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

      const exportResponse =
        await requestAssessmentService.getRequestAssessments(exportParams);

      if (exportResponse.success && exportResponse.data) {
        dataToExport = exportResponse.data;
      } else {
        throw new Error(
          exportResponse.message || "Failed to fetch all data for export."
        );
      }

      if (dataToExport.length === 0) {
        setSuccess("No data to export.");
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
        setLoading(false);
        return;
      }

      // 2. Convert data to CSV format
      const csvData = dataToExport.map((item) => ({
        "Patient Name": item.patientName,
        "Patient ID": item.patientId,
        Phone: item.phoneNumber,
        Age: item.age,
        "Assessment Type": item.assessmentType,
        Physician: item.assigningPhysician?.name || "N/A",
        "Assessment Date": new Date(item.assessmentDate).toLocaleDateString(),
        Time: `${item.timeHour}:${item.timeMinute} ${item.timeAmPm}`,
        Status: item.status,
        Created: new Date(item.createdAt).toLocaleDateString(),
      }));

      // 3. Create CSV content
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          headers.map((header) => `"${row[header] || ""}"`).join(",")
        ),
      ].join("\n");

      // 4. Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `booking-queue-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Data exported successfully");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError("Failed to export data");
      setTimeout(() => {
        setError(null);
      }, 3000);
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get status color (omitted for brevity)
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "info";
      case "completed":
        return "success";
      case "rejected":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  // Get status icon (omitted for brevity)
  // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case "completed":
  //       return <CheckCircleIcon />;
  //     case "rejected":
  //       return <XCircleIcon />;
  //     case "pending":
  //       return <ClockIcon />;
  //     default:
  //       return <ClockIcon />;
  //   }
  // };

  // Define columns for Material React Table (omitted for brevity)
  const columns = useMemo(
    () => [
      {
        accessorKey: "patientName",
        header: "Patient Name",
        size: 180,

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
                color: "#111827",
                fontSize: "14px",
              }}
            >
              {cell.getValue()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "patientId",
        header: "Patient ID",
        size: 180,
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
        accessorKey: "phoneNumber",
        header: "Phone",
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography
              sx={{ fontFamily: "Inter, sans-serif" }}
              variant="body2"
            >
              {cell.getValue()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "age",
        header: "Age",
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
          <Typography
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
            variant="body2"
          >
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "assessmentType",
        header: "Assessment Type",
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
            fontWeight: 400,
            color: "#6B7280",
          },
        },
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                fontSize: "14px",
              }}
              variant="body2"
            >
              {cell.getValue()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "assigningPhysician.name",
        header: "Physician",
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
            fontWeight: 400,
            color: "#6B7280",
          },
        },
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {row.original.assigningPhysician?.name || "N/A"}
          </Typography>
        ),
      },
      {
        accessorKey: "assessmentDate",
        header: "Assessment Date",
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
            fontWeight: 400,
            color: "#6B7280",
          },
        },
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                fontSize: "14px",
              }}
            >
              {new Date(cell.getValue()).toLocaleDateString()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "time",
        header: "Time",
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
            fontWeight: 400,
            color: "#6B7280",
          },
        },
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {`${row.original.timeHour}:${row.original.timeMinute} ${row.original.timeAmPm}`}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
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
            fontWeight: 400,
            color: "#6B7280",
          },
        },
        Cell: ({ cell, row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={cell.getValue()}
              color={getStatusColor(cell.getValue())}
              size="small"
              variant="outlined"
              // icon={getStatusIcon(cell.getValue())}
              sx={{
                fontWeight: "400",
                fontFamily: "Inter, sans-serif",
              }}
            />
            {cell.getValue() === "pending" && (
              <Tooltip title="Approve">
                <IconButton
                  size="small"
                  sx={{
                    fontWeight: "500",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onClick={() =>
                    handleStatusUpdate(row.original._id, "approved")
                  }
                  color="success"
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {cell.getValue() === "pending" && (
              <Tooltip title="Reject">
                <IconButton
                  size="small"
                  sx={{
                    fontWeight: "500",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onClick={() =>
                    handleStatusUpdate(row.original._id, "rejected")
                  }
                  color="error"
                >
                  <XCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        size: 140,
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
            {new Date(cell.getValue()).toLocaleDateString()}
          </Typography>
        ),
      },
    ],
    []
  );

  // Material React Table configuration
  const table = useMaterialReactTable({
    columns,
    data: requestAssessments,
    enableColumnFilters: false,
    enableGlobalFilter: false, // Disabled since we're using backend search
    enablePagination: false,
    enableSorting: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnResizing: true,
    enableRowSelection: false,
    enableMultiSort: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: "100vh",
      },
    },
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  // Initial load
  useEffect(() => {
    loadRequestAssessments(1);
    loadStats();
  }, []);

  return (
    <Box>
      <CognitiveAssessmentdetails NewAssessment={BookingQueueManagement} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 sm:gap-4 gap-2 mb-6 w-full px-0 lg:px-0">
        <BookingQueueCards
          title="Total Requests"
          value={stats.totalRequests.toLocaleString()}
        />

        <BookingQueueCards
          title="Pending"
          value={stats.pendingRequests.toLocaleString()}
        />

        <BookingQueueCards
          title="Approved"
          value={stats.approvedRequests.toLocaleString()}
        />

        <BookingQueueCards
          title="Completed"
          value={stats.completedRequests.toLocaleString()}
        />
      </div>
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
      {/* Custom Filters */}
      <Paper
        sx={{ borderRadius: 4 }}
        className={`pt-6 ${pagination.totalPages <= 1 && "pb-6"}`}
      >
        <Grid container spacing={2} alignItems="center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-3 w-full px-6 ">
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search by patient name, ID, phone, or physician..."
              value={filters?.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Patient Name"
              value={filters.patientName}
              onChange={(e) =>
                handleFilterChange("patientName", e.target.value)
              }
            />
            <TextField
              fullWidth
              size="small"
              label="Assessment Type"
              value={filters.assessmentType}
              onChange={(e) =>
                handleFilterChange("assessmentType", e.target.value)
              }
            />
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>

          <div className="sm:flex  w-full space-y-4 sm:space-y-0 justify-between items-center mt-2 mb-6 sm:px-6 px-4">
            <div className="sm:flex items-center gap-3  grid   grid-cols-2">
              <Button
                variant="contained"
                onClick={applyFilters}
                size="small"
                fullWidth
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
                  },
                  padding: "7px 30px",
                  borderRadius: "6px",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={clearFilters}
                size="small"
                fullWidth
                disabled={loading}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  borderRadius: "6px",
                  fontWeight: "500",
                  padding: "7px 30px",
                  border: "1px solid #9ca3af",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Clear
              </Button>
            </div>
            <div className="sm:flex items-center gap-3  grid   grid-cols-2">
              <Button
                onClick={() => {
                  // Refresh with current filters
                  setFilters((currentFilters) => {
                    loadRequestAssessments(
                      pagination.currentPage,
                      currentFilters
                    );
                    return currentFilters;
                  });
                }}
                startIcon={<RefreshIcon />}
                variant="outlined"
                size="small"
                disabled={loading}
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
                onClick={handleExport}
                startIcon={<DownloadIcon />}
                variant="outlined"
                size="small"
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #BAA377 0%, #A8956A 100%)",
                  color: "#ffffff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #A8956A 0%, #9A8760 100%)",
                  },
                  padding: "7px 30px",
                  borderRadius: "6px",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 2px 8px rgba(186, 163, 119, 0.3)",
                }}
              >
                Export
              </Button>
            </div>
          </div>
        </Grid>

        {/* Material React Table */}
        <MaterialReactTable table={table} />

        {pagination.totalPages > 1 && (
          <CustomTablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            loadPage={loadPage}
          />
        )}
      </Paper>
    </Box>
  );
};

export default BookingQueue;
