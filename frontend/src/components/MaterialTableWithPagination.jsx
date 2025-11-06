import React, { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import TablePagination from './TablePagination';

const MaterialTableWithPagination = ({
  columns,
  data,
  loading,
  pagination,
  onPaginationChange,
  enablePagination = true,
  serverSidePagination = false, // New prop to distinguish server-side vs client-side
  enableSorting = true,
  enableColumnFilters = true,
  enableGlobalFilter = true,
  enableRowSelection = false,
  enableColumnOrdering = false,
  enableColumnResizing = false,
  enableDensityToggle = false,
  enableFullScreenToggle = false,
  enableHiding = false,
  muiTableContainerProps = {},
  muiTableProps = {},
  muiTableHeadCellProps = {},
  muiTableBodyCellProps = {},
  muiTableBodyRowProps = {},
  renderTopToolbarCustomActions,
  renderBottomToolbarCustomActions,
  ...otherProps
}) => {
  // For client-side pagination, slice the data based on current page
  // For server-side pagination, use data as-is since it's already paginated by the server
  const paginatedData = useMemo(() => {
    if (!enablePagination || !pagination) return data;
    
    // If server-side pagination, don't slice the data
    if (serverSidePagination) return data;
    
    // For client-side pagination, slice the data
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, pagination, enablePagination, serverSidePagination]);

  const table = useMaterialReactTable({
    columns,
    data: paginatedData,
    state: {
      isLoading: loading,
      pagination: {
        pageIndex: pagination?.currentPage - 1 || 0,
        pageSize: pagination?.itemsPerPage || 10,
      },
    },
    enablePagination: false, // We'll handle pagination manually
    enableSorting,
    enableColumnFilters,
    enableGlobalFilter,
    enableRowSelection,
    enableColumnOrdering,
    enableColumnResizing,
    enableDensityToggle,
    enableFullScreenToggle,
    enableHiding,
    manualPagination: true,
    pageCount: pagination?.totalPages || 1,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: pagination?.currentPage - 1 || 0,
          pageSize: pagination?.itemsPerPage || 10,
        });
        if (onPaginationChange) {
          onPaginationChange({
            currentPage: newState.pageIndex + 1,
            itemsPerPage: newState.pageSize,
          });
        }
      }
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: 'calc(100vh - 200px)',
        border: '1px solid #e5e7eb',
        borderRadius: '8px 8px 0 0',
        ...muiTableContainerProps.sx,
      },
      ...muiTableContainerProps,
    },
    muiTableProps: {
      sx: {
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
        '& .MuiTableHead-root': {
          '& .MuiTableRow-root': {
            backgroundColor: '#f9fafb',
          },
        },
        '& .MuiTableBody-root': {
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: '#f8fafc',
            },
            '&:nth-of-type(even)': {
              backgroundColor: '#fafbfc',
            },
          },
        },
        ...muiTableProps.sx,
      },
      ...muiTableProps,
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        fontSize: '0.875rem',
        ...muiTableHeadCellProps.sx,
      },
      ...muiTableHeadCellProps,
    },
    muiTableBodyCellProps: {
      sx: {
        borderBottom: '1px solid #f3f4f6',
        padding: '12px 16px',
        fontSize: '0.875rem',
        color: '#374151',
        ...muiTableBodyCellProps.sx,
      },
      ...muiTableBodyCellProps,
    },
    muiTableBodyRowProps: {
      sx: {
        '&:last-child td': {
          borderBottom: 'none',
        },
        ...muiTableBodyRowProps.sx,
      },
      ...muiTableBodyRowProps,
    },
    renderTopToolbar: ({ table }) => (
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        {renderTopToolbarCustomActions && renderTopToolbarCustomActions({ table })}
      </div>
    ),
    renderBottomToolbar: ({ table }) => (
      <div>
        {renderBottomToolbarCustomActions && renderBottomToolbarCustomActions({ table })}
        {enablePagination && pagination && (
          <TablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page) => {
              if (onPaginationChange) {
                onPaginationChange({
                  currentPage: page,
                  itemsPerPage: pagination.itemsPerPage,
                });
              }
            }}
          />
        )}
      </div>
    ),
    ...otherProps,
  });

  return <MaterialReactTable table={table} />;
};

export default MaterialTableWithPagination;
