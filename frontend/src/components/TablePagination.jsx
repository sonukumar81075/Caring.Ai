/* eslint-disable no-unused-vars */
import React from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from "@mui/icons-material";

const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Always show pagination (removed the condition that hides it)
  // if (totalPages <= 1) {
  //   return null; // Don't show pagination if only one page
  // }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        py: 2,
        px: 2,
        backgroundColor: "#f8f9fa",
        borderRadius: "0 0 8px 8px",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      {/* First Page Button */}
      <IconButton
        onClick={handleFirstPage}
        disabled={currentPage === 1}
        sx={{
          width: 32,
          height: 32,
          backgroundColor: currentPage === 1 ? "#f3f4f6" : "white",
          border: "1px solid #d1d5db",
          color: currentPage === 1 ? "#9ca3af" : "#BAA377",
          "&:hover": {
            backgroundColor: currentPage === 1 ? "#f3f4f6" : "#f9fafb",
          },
          "&:disabled": {
            backgroundColor: "#f3f4f6",
            color: "#9ca3af",
          },
        }}
        size="small"
      >
        <FirstPageIcon fontSize="small" />
      </IconButton>

      {/* Previous Page Button */}
      <IconButton
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        sx={{
          width: 32,
          height: 32,
          backgroundColor: currentPage === 1 ? "#f3f4f6" : "white",
          border: "1px solid #d1d5db",
          color: currentPage === 1 ? "#9ca3af" : "#BAA377",
          "&:hover": {
            backgroundColor: currentPage === 1 ? "#f3f4f6" : "#f9fafb",
          },
          "&:disabled": {
            backgroundColor: "#f3f4f6",
            color: "#9ca3af",
          },
        }}
        size="small"
      >
        <KeyboardArrowLeftIcon fontSize="small" />
      </IconButton>

      {/* Page Numbers */}
      {pageNumbers.map((pageNum) => (
        <IconButton
          key={pageNum}
          onClick={() => handlePageClick(pageNum)}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: pageNum === currentPage ? "#BAA377" : "white",
            border:
              pageNum === currentPage
                ? "1px solid #BAA377"
                : "1px solid #d1d5db",
            color: pageNum === currentPage ? "white" : "#BAA377",
            fontWeight: pageNum === currentPage ? 600 : 400,
            "&:hover": {
              backgroundColor: pageNum === currentPage ? "#A8956A" : "#f9fafb",
            },
          }}
          size="small"
        >
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {pageNum}
          </Typography>
        </IconButton>
      ))}

      {/* Next Page Button */}
      <IconButton
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        sx={{
          width: 32,
          height: 32,
          backgroundColor: currentPage === totalPages ? "#f3f4f6" : "white",
          border: "1px solid #d1d5db",
          color: currentPage === totalPages ? "#9ca3af" : "#BAA377",
          "&:hover": {
            backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#f9fafb",
          },
          "&:disabled": {
            backgroundColor: "#f3f4f6",
            color: "#9ca3af",
          },
        }}
        size="small"
      >
        <KeyboardArrowRightIcon fontSize="small" />
      </IconButton>

      {/* Last Page Button */}
      <IconButton
        onClick={handleLastPage}
        disabled={currentPage === totalPages}
        sx={{
          width: 32,
          height: 32,
          backgroundColor: currentPage === totalPages ? "#f3f4f6" : "white",
          border: "1px solid #d1d5db",
          color: currentPage === totalPages ? "#9ca3af" : "#BAA377",
          "&:hover": {
            backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#f9fafb",
          },
          "&:disabled": {
            backgroundColor: "#f3f4f6",
            color: "#9ca3af",
          },
        }}
        size="small"
      >
        <LastPageIcon fontSize="small" />
      </IconButton>

      {/* Page Info (optional) */}
      {showInfo && !isMobile && (
        <Typography
          variant="body2"
          sx={{
            ml: 2,
            color: "#6b7280",
            fontSize: "0.875rem",
          }}
        >
          Page {currentPage} of {totalPages}
        </Typography>
      )}
    </Box>
  );
};

export default TablePagination;
