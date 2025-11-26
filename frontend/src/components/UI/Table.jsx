import React from "react";
import "./Table.css";

const Table = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No data available",
  className = "",
  onRowClick
}) => {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={column.style || {}}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? "table-row-clickable" : ""}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} style={column.style || {}}>
                  {column.render 
                    ? column.render(row, rowIndex) 
                    : row[column.accessor] || "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

