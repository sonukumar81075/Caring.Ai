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
  Card,
  CardContent,
  Grid,
  Divider,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import {
  MaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import MaterialTableWithPagination from "../MaterialTableWithPagination";
import auditLogService from "../../services/auditLogService";
import { FilterIcon, SearchIcon } from "lucide-react";
import { AuditLogsCards } from "../comman/AuditLogsCards";
import { useAuth } from "../../contexts/AuthContext";

const AuditLogs = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Statistics
  const [stats, setStats] = useState({
    totalLogs: 0,
    actionStats: [],
    recordTypeStats: [],
    recentLogs: [],
  });
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    recordType: "",
    startDate: "",
    endDate: "",
  });

  // Load audit logs
  const loadAuditLogs = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.action && { action: filters.action }),
        ...(filters.recordType && { recordType: filters.recordType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

      const response = await auditLogService.getAuditLogs(params);

      if (response.success) {
        setAuditLogs(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || "Failed to load audit logs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await auditLogService.getAuditLogStats();

      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadAuditLogs(1);
    loadStats();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      action: "",
      recordType: "",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadAuditLogs(1);
    loadStats();
  };

  // Initial load
  useEffect(() => {
    loadAuditLogs();
    loadStats();
  }, []);

  // Get role color
  const getRoleColor = (role) => {
    if (role === "SuperAdmin") return "error";
    if (role === "Clinic") return "warning";
    if (role === "Doctor") return "info";
    if (role === "Patient") return "success";
    return "default";
  };

  // Define columns for Material React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "action",
        header: "Action",
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
          <Typography
            variant="body2"
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
              paddingBottom: "4px",
              paddingTop: "4px",
            }}
          >
            {cell.getValue() || "N/A"}
          </Typography>
        ),
      },
      {
        accessorKey: "userName",
        header: "User",
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <PersonIcon fontSize="small" color="action" />
            <Typography
              variant="body2"
              sx={{
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                fontSize: "14px",
              }}
            >
              {cell.getValue() || "System"}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "userRole",
        header: "Role",
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
          <Chip
            label={cell.getValue() || "Unknown"}
            color={getRoleColor(cell.getValue())}
            size="small"
            variant="outlined"
            sx={{ fontFamily: "Inter, sans-serif" }}
          />
        ),
      },
      {
        accessorKey: "createdByName",
        header: "Created By",
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
        Cell: ({ row }) => (
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                color: "#1e293b",
                fontSize: "14px",
              }}
            >
              {row.original.createdByName || "System"}
            </Typography>
            {row.original.createdByEmail && (
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                {row.original.createdByEmail}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "recordType",
        header: "Record Type",
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
            {cell.getValue() || "N/A"}
          </Typography>
        ),
      },
      {
        accessorKey: "ip",
        header: "IP Address",
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "400",
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
        accessorKey: "userAgent",
        header: "User Agent",
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
          <Tooltip title={cell.getValue()} arrow>
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
                fontWeight: "400",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                fontSize: "14px",
              }}
            >
              {cell.getValue()}
            </Typography>
          </Tooltip>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date/Time",
        size: 200,
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
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2 "
              sx={{
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                fontSize: "14px",
              }}
            >
              {new Date(cell.getValue()).toLocaleString()}
            </Typography>
          </Box>
        ),
      },
    ],
    []
  );

  const handlePaginationChange = (newPagination) => {
    loadAuditLogs(newPagination.currentPage);
  };

  return (
    <Box>
      <div className="px-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] mt-6  outline-1 outline-offset-[-1px] outline-white/40  sm:mb-6 mb-3">
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
                    Audit Logs
                  </h2>
                  <p className="text-sm text-gray-600  ">
                    {user?.role === "SuperAdmin"
                      ? "Viewing all system audit logs from all users"
                      : "Viewing your personal audit logs and activity history"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4 gap-2 mb-6 w-full px-4">
        <AuditLogsCards
          title="Total Logs"
          value={stats?.totalLogs.toLocaleString()}
        />

        <AuditLogsCards
          title="Recent Actions"
          value={stats?.recentLogs?.length}
        />

        <AuditLogsCards
          title="Top Action"
          value={stats?.actionStats?.[0]?._id || "N/A"}
        />

        <AuditLogsCards
          title="Top Record Type"
          value={stats?.recordTypeStats?.[0]?._id || "N/A"}
        />
      </div>

      {/* Error Alert */}
      <div className="px-4">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
      </div>

      {/* Custom Filters */}
      <Paper sx={{ p: 2 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6 w-full ">
          <TextField
            fullWidth
            size="small"
            label="Search"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
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
          />
          <TextField
            fullWidth
            size="small"
            label="Action"
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
            sx={{
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
          />
          <TextField
            fullWidth
            size="small"
            label="Record Type"
            value={filters.recordType}
            onChange={(e) => handleFilterChange("recordType", e.target.value)}
            sx={{
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
            sx={{
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
            sx={{
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
          />
        </div>
        <div className="flex w-full  justify-between  gap-2 mt-2">
          <Button
            sx={{
              backgroundColor: "#334155",
              "&:hover": {
                backgroundColor: "#192636",
              },  
              padding: "7px 30px",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
            }}
            variant="contained"
            onClick={applyFilters}
          >
            Apply
          </Button>
          <Button
            variant="contained"
            onClick={clearFilters}
            style={{
              backgroundColor: "#BAA377",
              color: "#ffffff",
              borderRadius: "6px",
              fontWeight: "500",
              padding: "7px 30px",
              border: "1px solid #BAA377",
              fontFamily: "Inter, sans-serif",
            }}
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
            Clear
          </Button>
          <div className="items-end text-end flex justify-end w-full">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => loadAuditLogs(pagination.currentPage)}
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
              Refresh
            </Button>
          </div>
        </div>
      </Paper>

      <MaterialTableWithPagination
        columns={columns}
        data={auditLogs}
        loading={loading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        enablePagination={true}
        serverSidePagination={true}
        enableSorting={true}
        enableColumnFilters={false}
        enableTopToolbar={false}
        enableGlobalFilter={true}
        enableRowSelection={false}
        enableColumnOrdering={false}
        enableColumnResizing={true}
        enableDensityToggle={true}
        enableFullScreenToggle={true}
        enableHiding={true}
        muiTableContainerProps={{
          sx: {
            maxHeight: "100vh",
          },
        }}
        renderTopToolbarCustomActions={({ table }) => (
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              p: "8px",
              flexWrap: "wrap",
            }}
          >
            <MRT_GlobalFilterTextField table={table} />
          </Box>
        )}
      />
    </Box>
  );
};

export default AuditLogs;
