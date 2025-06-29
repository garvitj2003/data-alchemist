"use client";

import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { DataGrid, Column, RenderCellProps } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import {
  uploadedFilesAtom,
  validationErrorsAtom,
  EntityType,
  parsedFile,
  ValidationErrors,
  aiModificationsAtom,
} from "@/store/uploadAtoms";
import { validateSingleRow } from "@/lib/validators";
import { normalizeRowTypes } from "@/utils/normalizeData";
import { useAIModifyTable } from "@/hooks/useAiDataModification";

type EntityTableProps = {
  entity: EntityType;
  fixes?: Record<string, Record<string, any>>; // EntityName → rowIdx → { field: value }
  fixCell?: (
    entity: EntityType,
    rowIdx: number,
    key: string,
    value: any
  ) => void;
};

// Custom cell renderer to show validation errors
function CellRenderer({
  row,
  column,
  rowIdx,
  onRowChange,
  onRowsChange,
}: RenderCellProps<any> & { onRowsChange: (rows: any[]) => void }) {
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
          ${cellError ? "bg-red-50 text-red-900" : ""}
        `}
      >
        {cellValue || ""}
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

export default function EntityTable({
  entity,
  fixes,
  fixCell,
}: EntityTableProps) {
  const [files, setFiles] = useAtom(uploadedFilesAtom);
  const [errors, setErrors] = useAtom(validationErrorsAtom);
  const [aiModifications] = useAtom(aiModificationsAtom);

  // Get pending changes from AI modification hook
  const { pendingChanges } = useAIModifyTable(entity);

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
  const debouncedValidation = (
    rowIndex: number,
    updatedRow: Record<string, any>
  ) => {
    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set new timeout for validation
    validationTimeoutRef.current = setTimeout(() => {
      // Validate the single row
      const rowErrors = validateSingleRow(entity, updatedRow, files);

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

        return newErrors;
      });
    }, 500); // 500ms debounce delay
  };

  // Find the file data for this entity
  const fileData = files.find((f) => f.entityType === entity);

  // If no data found, show message
  if (!fileData || !fileData.rawData || fileData.rawData.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-900 dark:text-white text-lg">
          No data available
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Upload a CSV file to get started
        </p>
      </div>
    );
  }

  const rows = fileData.rawData;

  // Create columns dynamically based on the first row's keys
  const columns: Column<any>[] = Object.keys(rows[0] || {}).map(
    (columnKey) => ({
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
            w-full h-full px-3 py-2 border-none outline-none bg-transparent text-gray-900 dark:text-white text-sm
            ${
              hasError
                ? "bg-red-50 border-l-2 border-red-400"
                : "focus:bg-blue-50 focus:ring-1 focus:ring-blue-300"
            }
          `}
            value={props.row[columnKey] || ""}
            onChange={(e) => {
              // Update the row immediately for responsive UI
              props.onRowChange({ ...props.row, [columnKey]: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") {
                props.onClose();
              }
              if (e.key === "Escape") {
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

        // Check for pending AI changes (before acceptance)
        const pendingChange = pendingChanges?.[props.rowIdx]?.[columnKey];
        const hasPendingChange = pendingChange !== undefined;

        // Check if this cell was modified by AI (after acceptance)
        const isAIModified =
          aiModifications[entity]?.[props.rowIdx]?.[columnKey] === true;

        const displayValue =
          typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : value ?? "";

        const pendingDisplayValue = hasPendingChange
          ? typeof pendingChange === "object" && pendingChange !== null
            ? JSON.stringify(pendingChange)
            : pendingChange ?? ""
          : "";

        const fix = fixes?.[props.rowIdx]?.[columnKey];
        const hasAIFix = fix !== undefined;

        return (
          <div
            className={`
              w-full h-full flex flex-col justify-center px-3 py-2 relative bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors
              ${hasError ? "bg-red-50 border-l-2 border-red-400" : ""}
              ${
                hasPendingChange
                  ? "bg-yellow-50 border-l-2 border-yellow-400"
                  : ""
              }
              ${
                isAIModified && !hasPendingChange
                  ? "bg-green-50 border-l-2 border-green-400"
                  : ""
              }
              ${
                hasAIFix && !hasError && !hasPendingChange && !isAIModified
                  ? "bg-blue-50 border-l-2 border-blue-400"
                  : ""
              }
            `}
          >
            {/* Main content area */}
            <div className="flex items-center justify-between">
              {hasPendingChange ? (
                <div className="flex-1 overflow-hidden">
                  {/* Current value (smaller, grayed out) */}
                  <div className="text-xs text-gray-400 dark:text-gray-500 line-through truncate">
                    Current: {displayValue || "(empty)"}
                  </div>
                  {/* Pending value (highlighted in gray until accepted) */}
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded">
                    Pending: {pendingDisplayValue}
                  </div>
                </div>
              ) : (
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-gray-900 dark:text-white text-sm">
                  {displayValue}
                </span>
              )}

              {/* Status indicators and actions */}
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                {/* Pending change indicator */}
                {hasPendingChange && (
                  <div
                    className="w-2 h-2 bg-yellow-500 rounded-full cursor-help"
                    title={`Pending AI change: ${pendingDisplayValue}`}
                  />
                )}

                {/* AI Fix button or status */}
                {hasAIFix && !isAIModified && (
                  <>
                    {hasError && fixCell ? (
                      <button
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded"
                        onClick={() => {
                          // Apply the fix to the current row
                          const updatedRow = { ...props.row, [columnKey]: fix };
                          const normalizedRow = normalizeRowTypes(
                            entity,
                            updatedRow
                          );

                          // Update the file data in the atom
                          setFiles((prevFiles) =>
                            prevFiles.map((file) =>
                              file.entityType === entity
                                ? {
                                    ...file,
                                    rawData: file.rawData.map((row, idx) =>
                                      idx === props.rowIdx ? normalizedRow : row
                                    ),
                                  }
                                : file
                            )
                          );

                          // Trigger validation for this row
                          debouncedValidation(props.rowIdx, normalizedRow);

                          // Call the original fixCell function if needed for any additional logic
                          fixCell(entity, props.rowIdx, columnKey, fix);
                        }}
                        title={`AI suggestion: ${JSON.stringify(fix)}`}
                      >
                        Fix
                      </button>
                    ) : (
                      <span className="text-xs text-green-700 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                        AI Fixed
                      </span>
                    )}
                  </>
                )}

                {/* Error indicator */}
                {hasError && (
                  <div
                    className="w-2 h-2 bg-red-500 rounded-full cursor-help"
                    title={hasError}
                  />
                )}
              </div>
            </div>

            {/* Additional status tags */}
            {(hasPendingChange || isAIModified || hasAIFix) && (
              <div className="flex items-center gap-1 mt-1">
                {hasPendingChange && (
                  <span className="text-xs bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded">
                    Pending
                  </span>
                )}
                {isAIModified && !hasPendingChange && (
                  <span className="text-xs bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                    AI Modified
                  </span>
                )}
                {hasAIFix &&
                  !hasError &&
                  !isAIModified &&
                  !hasPendingChange && (
                    <span className="text-xs bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                      Fix Available
                    </span>
                  )}
              </div>
            )}
          </div>
        );
      },
    })
  );

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
          file.entityType === entity ? { ...file, rawData: updatedRows } : file
        )
      );

      // ✅ Validate the normalized row
      debouncedValidation(changedRowIndex, normalizedRow);
    }
  };

  // Generate unique row key
  const rowKeyGetter = (row: any) => {
    // Try common ID fields, fallback to a combination of values or stringified row
    return (
      row.id ||
      row.ClientID ||
      row.WorkerID ||
      row.TaskID ||
      JSON.stringify(row)
    );
  };

  return (
    <div className="w-full">
      {/* Simple instruction */}
      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        Double click to edit cell
      </div>

      {/* Data Grid */}

      <DataGrid
        columns={columns}
        rows={rows}
        onRowsChange={handleRowsChange}
        rowKeyGetter={rowKeyGetter}
        className="rdg-light dark:rdg-dark"
        style={
          {
            "--rdg-background-color": "transparent",
            "--rdg-header-background-color": "rgba(248, 250, 252, 0.8)",
            "--rdg-row-hover-background-color": "rgba(241, 245, 249, 0.5)",
            "--rdg-row-selected-background-color": "rgba(224, 242, 254, 0.8)",
            "--rdg-border-color": "#e2e8f0",
            "--rdg-summary-border-color": "#e2e8f0",
            "--rdg-cell-frozen-background-color": "transparent",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
