"use client";

import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import  { DataGrid,Column, RenderCellProps } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import {
  uploadedFilesAtom,
  validationErrorsAtom,
  EntityType,
  parsedFile,
  ValidationErrors,
} from "@/store/uploadAtoms";
import { validateSingleRow } from "@/lib/validators";
import { normalizeRowTypes } from "@/utils/normalizeData";

type EntityTableProps = {
  entity: EntityType;
};

// Custom cell renderer to show validation errors
function CellRenderer({ row, column, rowIdx, onRowChange, onRowsChange }: RenderCellProps<any> & { onRowsChange: (rows: any[]) => void }) {
  const [errors] = useAtom(validationErrorsAtom);
  const cellValue = row[column.key];
  
  // Check if this specific cell has an error
  const cellError = errors[column.key as EntityType]?.[rowIdx]?.[column.key];

  return (
    <div className="relative w-full h-full flex items-center">
      {/* Cell content */}
      <span 
        className={`
          flex-1 px-2 py-1 min-h-full flex items-center
          ${cellError ? 'bg-red-50 text-red-900' : ''}
        `}
      >
        {cellValue || ''}
      </span>
      
      {/* Error indicator */}
      {cellError && (
        <div 
          className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
          title={cellError}
        />
      )}
    </div>
  );
}

export default function EntityTable({ entity }: EntityTableProps) {
  const [files, setFiles] = useAtom(uploadedFilesAtom);
  const [errors, setErrors] = useAtom(validationErrorsAtom);
  
  // Debounce timer ref for validation
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Debounced validation function
  const debouncedValidation = (rowIndex: number, updatedRow: Record<string, any>) => {
    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set new timeout for validation
    validationTimeoutRef.current = setTimeout(() => {
      console.log(`Validating row ${rowIndex} for entity ${entity}`, updatedRow);
      // Validate the single row
      const rowErrors = validateSingleRow(entity, updatedRow);
      console.log(`Validation result for row ${rowIndex}:`, rowErrors);
      
      // Update validation errors atom
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        
        // Initialize entity errors if not exists
        if (!newErrors[entity]) {
          newErrors[entity] = {};
        }
        
        // Always update/replace the row errors (even if empty)
        if (Object.keys(rowErrors).length === 0) {
          // No errors - remove this row's errors completely
          if (newErrors[entity]![rowIndex]) {
            delete newErrors[entity]![rowIndex];
          }
          
          // If no more errors for this entity, remove entity key
          if (Object.keys(newErrors[entity]!).length === 0) {
            delete newErrors[entity];
          }
        } else {
          // Has errors - set new errors for this row
          newErrors[entity]![rowIndex] = rowErrors;
        }
        
        console.log(`Updated validation errors:`, newErrors);
        return newErrors;
      });
    }, 500); // 500ms debounce delay
  };

  // Find the file data for this entity
  const fileData = files.find((f) => f.entityType === entity);

  // If no data found, show message
  if (!fileData || !fileData.rawData || fileData.rawData.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 text-lg">
          No data found for <span className="font-semibold capitalize">{entity}</span>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Please upload and parse a CSV file for this entity type.
        </p>
      </div>
    );
  }

  const rows = fileData.rawData;

  // Create columns dynamically based on the first row's keys
  const columns: Column<any>[] = Object.keys(rows[0] || {}).map((columnKey) => ({
    key: columnKey,
    name: columnKey.charAt(0).toUpperCase() + columnKey.slice(1), // Capitalize first letter
    resizable: true,
    editable: true,
    // Use renderEditCell for custom editing with error display
    renderEditCell: (props) => {
      const hasError = errors[entity]?.[props.rowIdx]?.[columnKey];
      
      return (
        <input
          className={`
            w-full h-full px-2 border-none outline-none bg-white
            ${hasError ? 'bg-red-50 border-2 border-red-400' : 'focus:bg-blue-50'}
          `}
          value={props.row[columnKey] || ''}
          onChange={(e) => {
            // Update the row immediately for responsive UI
            props.onRowChange({ ...props.row, [columnKey]: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
              props.onClose();
            }
            if (e.key === 'Escape') {
              props.onClose(true); // true = revert changes
            }
          }}
          autoFocus
          title={hasError ? hasError : undefined}
          placeholder={hasError ? "Fix validation error" : ""}
        />
      );
    },
    // Use renderCell for display mode with error indicators
    renderCell: (props: RenderCellProps<any>) => {
  const hasError = errors[entity]?.[props.rowIdx]?.[columnKey];
  const value = props.row[columnKey];

  const displayValue = typeof value === "object" && value !== null
    ? JSON.stringify(value)
    : value ?? '';

  return (
    <div
      className={`
        w-full h-full flex items-center px-2 relative
        ${hasError ? 'bg-red-50 border-l-2 border-red-400' : ''}
      `}
    >
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {displayValue}
      </span>
      {hasError && (
        <div 
          className="w-3 h-3 bg-red-500 rounded-full ml-2 flex-shrink-0 cursor-help"
          title={hasError}
        />
      )}
    </div>
  );
}
  }));

  // Handle row changes when user edits cells
  const handleRowsChange = (newRows: any[]) => {
  console.log("Updating rows for entity:", entity);

  const oldRows = fileData.rawData;
  let changedRowIndex = -1;
  let changedRow = null;

  for (let i = 0; i < newRows.length; i++) {
    if (JSON.stringify(newRows[i]) !== JSON.stringify(oldRows[i])) {
      changedRowIndex = i;
      changedRow = newRows[i];
      break;
    }
  }

  if (changedRowIndex !== -1 && changedRow) {
    const normalizedRow = normalizeRowTypes(entity, changedRow);

    // Replace the raw row with normalized one
    const updatedRows = [...newRows];
    updatedRows[changedRowIndex] = normalizedRow;

    // ✅ Save normalized rows into atom
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.entityType === entity
          ? { ...file, rawData: updatedRows }
          : file
      )
    );

    // ✅ Validate the normalized row
    debouncedValidation(changedRowIndex, normalizedRow);
  }
};

  // Generate unique row key
  const rowKeyGetter = (row: any) => {
    // Try common ID fields, fallback to a combination of values or stringified row
    return row.id || row.ClientID || row.WorkerID || row.TaskID || JSON.stringify(row);
  };

  // Count total errors for this entity
  const entityErrors = errors[entity] || {};
  const totalErrors = Object.values(entityErrors).reduce(
    (sum, rowErrors) => sum + Object.keys(rowErrors).length, 
    0
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-t-lg border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {entity} Data
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {rows.length} rows • {columns.length} columns
            </p>
          </div>
          
          {/* Error badge */}
          {totalErrors > 0 && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalErrors} validation error{totalErrors !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Double-click any cell to edit. Red highlighting indicates validation errors.
        </p>
      </div>

      {/* Data Grid */}
      <div className="border rounded-b-lg overflow-hidden shadow-sm">
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={handleRowsChange}
          rowKeyGetter={rowKeyGetter}
          className="rdg-light"
          rowHeight={40}
          headerRowHeight={40}
          defaultColumnOptions={{
            sortable: true,
            resizable: true,
          }}
        />
      </div>
    </div>
  );
}