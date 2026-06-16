import React, { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import './ThresholdsTable.css';

const customStyles = {
  table: { style: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' } },
  headRow: { style: { backgroundColor: '#f7f8fa', minHeight: '48px' } },
  headCells: { style: { color: '#6b7280', fontWeight: 600 } },
  rows: { highlightOnHoverStyle: { backgroundColor: '#eef2ff' } },
};



const ThresholdsTable = ({ thresholds, selectedRow, onSelectedChange }) => {
  const columns = useMemo(() => [
    { name: 'SL', selector: (row, i) => row.sl ?? i + 1, width: '70px' },
    { name: 'THRESHOLD(S) NAME', selector: row => row.name },
    { name: 'THRESHOLD START', selector: row => row.start, cell: row => <div style={{ textAlign: 'right' }}>{row.start}</div> },
    { name: 'THRESHOLD END', selector: row => row.end, cell: row => <div style={{ textAlign: 'right' }}>{row.end}</div> },
    { name: 'DURATION (SEC)', selector: row => row.duration, cell: row => <div style={{ textAlign: 'right' }}>{row.duration}</div> },
  ], []);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#ffffff",
        color: "black",
        fontWeight: "300",
        fontSize: "14px",
        textTransform: "uppercase",
        borderBottom: "2px solid #ddd",
        fontFamily: "Inter, sans-serif",
      },
    },
    cells: {
      style: {
        fontSize: "16px",
        fontWeight: "400",
        padding: "10px 15px",
        fontFamily: "Inter, sans-serif",
      },
    },
    rows: {
      style: {
        minHeight: "48px", // row height
        "&:hover": {
          backgroundColor: "#f0f9ff", // hover background
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #ddd",
        padding: "10px",
        fontFamily: "Inter, sans-serif",
      },
    },
  };

  return (
    // <div className="thresholds-table-container">
    <div style={{ maxHeight: "650px", overflowY: "scroll" }}>
      <DataTable
        columns={columns}
        data={thresholds}
        customStyles={customStyles}
        highlightOnHover
        pointerOnHover
        onRowClicked={(row) => onSelectedChange(row)}
        conditionalRowStyles={[{
          when: row => selectedRow ? row === selectedRow : false,
          style: { backgroundColor: '#eef2ff' }
        }]}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 15, 20]}
      />
    </div>
  );
};

export default ThresholdsTable;
