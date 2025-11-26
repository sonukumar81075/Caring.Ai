import React, { useMemo, useState, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import { LogsModal } from "../components/LogsModal";
import { RecordingPlayerButtons } from "../components/RecordingPlayerButtons";
import { AssessmentResultsManagement } from "../DynamicData.js";
import requestAssessmentService from "../services/requestAssessmentService.js";

import { IoPlayOutline } from "react-icons/io5";
import { TbReload } from "react-icons/tb";
import { GoDownload } from "react-icons/go";
import CognitiveAssessmentdetails from "../components/requestAssessment/CognitiveAssessmentdetails.jsx";

import { Pagination, Box, useTheme, CircularProgress, Alert } from "@mui/material";
import { Link } from "react-router-dom";

const BUTTON_CONFIG = [
  {
    Icon: IoPlayOutline,
    label: "Play recording",
    key: "play",
  },
  {
    Icon: TbReload,
    label: "Replay recording",
    key: "reload",
  },
  {
    Icon: GoDownload,
    label: "Download recording",
    key: "download",
  },
];

const AssessmentResults = () => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch assessment results data
  const fetchAssessmentResults = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await requestAssessmentService.getAssessmentResults({
        page,
        limit
      });
      
      if (response.success) {
        setAssessmentResults(response.data);
        setPagination({
          currentPage: response.pagination.currentPage,
          itemsPerPage: response.pagination.itemsPerPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
        });
      } else {
        setError('Failed to fetch assessment results');
      }
    } catch (err) {
      console.error('Error fetching assessment results:', err);
      setError(err.message || 'Failed to fetch assessment results');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAssessmentResults();
  }, []);

  const handleViewMore = React.useCallback((logs) => {
    setCurrentLogs(logs);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLogs("");
  };

  const handlePageChange = (event, page) => {
    fetchAssessmentResults(page, pagination.itemsPerPage);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "assessmentId",
        header: "Assessment ID",
        Cell: ({ cell }) => (
          <span
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue()}
          </span>
        ),
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
            fontFamily: "Inter",
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
            fontFamily: "Inter",
            fontWeight: 500,
          },
        },
      },
      {
        accessorKey: "patientName",
        header: "Patient Name",
        Cell: ({ cell }) => (
          <span
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue()}
          </span>
        ),
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
            color: "#111827",
          },
        },
      },
      {
        accessorKey: "patientId",
        header: "Patient ID",
        Cell: ({ cell }) => (
          <span
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue()}
          </span>
        ),
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
            color: "#111827",
          },
        },
      },
      {
        accessorKey: "assignedTest",
        header: "Assigned Test",
        Cell: ({ cell }) => (
          <span
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue()}
          </span>
        ),
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
            color: "#111827",
          },
        },
      },
      {
        accessorKey: "scheduledTime",
        header: "Scheduled Time",
        Cell: ({ cell }) => (
          <span
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue()}
          </span>
        ),
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
            color: "#111827",
          },
        },
      },
      {
        accessorKey: "currentStatus",
        header: "Current Status",
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
        Cell: ({ cell }) => {
          const status = cell.getValue();

          let backgroundColor = "";
          let textColor = "";
          let borderColor = "";
          const defaultTextColor = "#6B7280";

          switch (status) {
            case "Scheduled":
              backgroundColor = "#f0f9ff";
              textColor = "#0369a1";
              borderColor = "#bae6fd";
              break;
            case "Data Found":
              backgroundColor = "#f0fdf4";
              textColor = "#047857";
              borderColor = "#a7f3d0";
              break;
            case "Data Missing":
              backgroundColor = "#fff1f2";
              textColor = "#b91c1c";
              borderColor = "#fecaca";
              break;
            case "Waiting for Updates":
              backgroundColor = "#fffbeb";
              textColor = "#b45309";
              borderColor = "#fde68a";
              break;
            default:
              backgroundColor = "transparent";
              textColor = defaultTextColor;
              borderColor = "#d1d5db";
              break;
          }
          return (
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "9999px",
                border: `1px solid ${borderColor}`,

                fontSize: "13px",
                fontFamily: "Inter",
                fontWeight: 400,
                backgroundColor: backgroundColor,
                color: textColor,
              }}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "awazCallId",
        header: "Retell Call ID",
        size: 200,
        Cell: ({ cell }) => (
          <span
            sx={{
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              fontSize: "14px",
            }}
          >
            {cell.getValue()}
          </span>
        ),
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
            color: "#111827",
          },
        },
      },
      {
        accessorKey: "report",
        header: "Report",
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
            color: "#111827",
          },
        },
        Cell: ({ row }) => {
          const rawId = row?.original?.assessmentId;
          const encodedId = rawId ? btoa(String(rawId)) : "";
          const to = encodedId ? `/assessment-results/${encodedId}` : "/assessment-results";
          return (
            <Link to={to} className="text-gray-600 text-center bg-gray-300 py-1.5 w-full text-[15px] rounded-sm cursor-pointer">
              View Report
            </Link>
          );
        },
      },
      {
        accessorKey: "recording_url",
        header: "Recording",
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
            fontWeight: 300,
          },
        },
        Cell: ({ row }) => (
          <RecordingPlayerButtons
            BUTTON_CONFIG={BUTTON_CONFIG}
            url={row?.original?.recording_url}
          />
        ),
      },
      {
        accessorKey: "logs",
        header: "Logs",
        size: 400,
        enablePinning: true,
        pinned: "right",
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
        Cell: ({ row }) => {
          const logText = row.original.logs;
          const lines = logText
            .split("|")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          const preview = lines[0] || "No logs found";
          const cleanPreview = preview
            .replace(/^\[.*?\]\s*/, "")
            .split(" - ")[0];

          return (
            <div className="flex flex-col">
              <p className="line-clamp-2 text-sm text-[#4b5563]">
                {cleanPreview}
              </p>

              {lines.length > 1 && (
                <button
                  onClick={() => handleViewMore(logText)}
                  className=" underline text-md mt-0.5 text-left font-[500] cursor-pointer text-[#4b5563]"
                >
                  ...More ({lines.length} total)
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleViewMore]
  );

  // Show loading state
  if (loading) {
    return (
      <div className="mt-6">
        <CognitiveAssessmentdetails NewAssessment={AssessmentResultsManagement} />
        <Box
          sx={{
            borderRadius: "1rem",
            border: "1px solid #e5e7eb",
            boxShadow: "none",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress sx={{ color: "#BAA377" }} />
        </Box>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-6">
        <CognitiveAssessmentdetails NewAssessment={AssessmentResultsManagement} />
        <Box
          sx={{
            borderRadius: "1rem",
            border: "1px solid #e5e7eb",
            boxShadow: "none",
            overflow: "hidden",
            padding: "20px",
          }}
        >
          <Alert severity="error">{error}</Alert>
        </Box>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <CognitiveAssessmentdetails NewAssessment={AssessmentResultsManagement} />

      <Box
        sx={{
          borderRadius: "1rem",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        <MaterialReactTable
          columns={columns}
          data={assessmentResults}
          enablePagination={false}
          enableSorting={true}
          enableColumnFilters={false}
          enableGlobalFilter={false}
          enableRowSelection={false}
          enableColumnOrdering={false}
          enableColumnResizing={true}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableBottomToolbar={false}
          enableTopToolbar={false}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#F3F4F6",
          }}
        >
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="medium"
            sx={{
              "& .MuiPaginationItem-root": {
                margin: "0 4px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                fontWeight: 500,
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                },
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#BAA377",
                color: "#ffffff",
                border: "1px solid #BAA377",
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "#A8956A",
                },
              },
              "& .MuiPaginationItem-icon": {
                color: theme.palette.text.secondary,
              },
            }}
          />
          <Box
            sx={{
              marginLeft: 2,
              color: "#6B7280",
              fontFamily: "Inter",
              fontSize: "0.875rem",
            }}
          >
            Page {pagination.currentPage} of {pagination.totalPages}
          </Box>
        </Box>
      </Box>

      <LogsModal
        isVisible={isModalOpen}
        logs={currentLogs}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AssessmentResults;
