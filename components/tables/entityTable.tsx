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
  const [aiModifications, setAiModifications] = useAtom(aiModificationsAtom);

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

  // Immediate batch validation function for multiple rows
  const batchValidateRows = (rowIndices: Set<number>, rows: any[]) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      // Initialize entity errors if not exists
      if (!newErrors[entity]) {
        newErrors[entity] = {};
      }

      // Validate each affected row
      rowIndices.forEach((rowIndex) => {
        if (rowIndex >= 0 && rowIndex < rows.length) {
          const rowErrors = validateSingleRow(entity, rows[rowIndex], files);

          // Update/replace the row errors (even if empty)
          if (Object.keys(rowErrors).length === 0) {
            // No errors - remove this row's errors completely
            if (newErrors[entity]![rowIndex]) {
              delete newErrors[entity]![rowIndex];
            }
          } else {
            // Has errors - set new errors for this row
            newErrors[entity]![rowIndex] = rowErrors;
          }
        }
      });

      // If no more errors for this entity, remove entity key
      if (Object.keys(newErrors[entity]!).length === 0) {
        delete newErrors[entity];
      }

      return newErrors;
    });
  };

  // Find the file data for this entity
  const fileData = files.find((f) => f.entityType === entity);

  // Check if there are any fixes available
  const hasAvailableFixes = () => {
    if (!fixes || !fileData) return false;

    return Object.keys(fixes).some((rowIdx) => {
      const rowFixes = fixes[rowIdx];
      if (!rowFixes) return false;

      return Object.keys(rowFixes).some((fieldKey) => {
        // Only count as available fix if there's an error for this cell and it hasn't been AI-modified yet
        const hasError = errors[entity]?.[parseInt(rowIdx)]?.[fieldKey];
        const isAlreadyAIModified =
          aiModifications[entity]?.[parseInt(rowIdx)]?.[fieldKey];
        return (
          hasError && rowFixes[fieldKey] !== undefined && !isAlreadyAIModified
        );
      });
    });
  };

  // Apply all available fixes at once
  const handleFixAll = () => {
    if (!fixes || !fileData) return;

    const rows = [...fileData.rawData];
    const affectedRowIndices = new Set<number>();
    const aiModificationUpdates: Record<number, Record<string, boolean>> = {};

    // Apply all fixes
    Object.keys(fixes).forEach((rowIdxStr) => {
      const rowIdx = parseInt(rowIdxStr);
      if (rowIdx >= 0 && rowIdx < rows.length) {
        const rowFixes = fixes[rowIdx];
        let rowUpdated = false;

        Object.keys(rowFixes).forEach((fieldKey) => {
          // Only apply fix if there's an error for this cell
          const hasError = errors[entity]?.[rowIdx]?.[fieldKey];
          if (hasError && rowFixes[fieldKey] !== undefined) {
            rows[rowIdx] = { ...rows[rowIdx], [fieldKey]: rowFixes[fieldKey] };
            rowUpdated = true;

            // Track this cell for AI modification marking
            if (!aiModificationUpdates[rowIdx]) {
              aiModificationUpdates[rowIdx] = {};
            }
            aiModificationUpdates[rowIdx][fieldKey] = true;
          }
        });

        if (rowUpdated) {
          // Normalize the row
          rows[rowIdx] = normalizeRowTypes(entity, rows[rowIdx]);
          affectedRowIndices.add(rowIdx);
        }
      }
    });

    // Update the files atom with all fixed rows
    if (affectedRowIndices.size > 0) {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.entityType === entity ? { ...file, rawData: rows } : file
        )
      );

      // Mark all fixed cells as AI-modified
      setAiModifications((prev) => {
        const newModifications = { ...prev };
        if (!newModifications[entity]) {
          newModifications[entity] = {};
        }

        Object.keys(aiModificationUpdates).forEach((rowIdxStr) => {
          const rowIdx = parseInt(rowIdxStr);
          if (!newModifications[entity]![rowIdx]) {
            newModifications[entity]![rowIdx] = {};
          }
          newModifications[entity]![rowIdx] = {
            ...newModifications[entity]![rowIdx],
            ...aiModificationUpdates[rowIdx],
          };
        });

        return newModifications;
      });

      // Trigger batch validation for all affected rows (immediate, no debouncing)
      batchValidateRows(affectedRowIndices, rows);

      // Call fixCell for each applied fix if the callback exists
      if (fixCell) {
        Object.keys(fixes).forEach((rowIdxStr) => {
          const rowIdx = parseInt(rowIdxStr);
          const rowFixes = fixes[rowIdx];
          Object.keys(rowFixes).forEach((fieldKey) => {
            const hasError = errors[entity]?.[rowIdx]?.[fieldKey];
            if (hasError && rowFixes[fieldKey] !== undefined) {
              fixCell(entity, rowIdx, fieldKey, rowFixes[fieldKey]);
            }
          });
        });
      }
    }
  };

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
            w-full h-full px-3 py-2 border-none outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-colors
            ${
              hasError
                ? "bg-red-50 dark:bg-red-900/20 border-l-2 border-red-400 dark:border-red-500"
                : "focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-500"
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
              w-full h-full flex items-center px-3 py-2 relative
              ${hasError ? "bg-red-500/70 dark:bg-red-500/70" : ""}
              ${hasPendingChange ? "bg-yellow-500/70 dark:bg-yellow-900/20" : ""}
              ${
                isAIModified && !hasPendingChange
                  ? "bg-green-400/70 dark:bg-green-400/60"
                  : ""
              }
              ${
                hasAIFix && !hasError && !hasPendingChange && !isAIModified
                  ? "bg-blue-50/70 dark:bg-blue-900/20"
                  : ""
              }
              hover:bg-gray-50/50 dark:hover:bg-gray-800/50
            `}
            title={
              hasError
                ? `Error: ${hasError}`
                : hasPendingChange
                ? `Pending AI change: ${pendingDisplayValue}`
                : isAIModified
                ? "AI Modified"
                : hasAIFix
                ? `AI suggestion available: ${JSON.stringify(fix)}`
                : undefined
            }
          >
            {hasPendingChange ? (
              <div className="flex-1 overflow-hidden">
                {/* Current value (smaller, grayed out) */}
                <div className="text-xs text-gray-400 dark:text-gray-500 line-through truncate">
                  Current: {displayValue || "(empty)"}
                </div>
                {/* Pending value (highlighted) */}
                <div className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                  Pending: {pendingDisplayValue}
                </div>
              </div>
            ) : (
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-gray-900 dark:text-white text-sm">
                {displayValue}
              </span>
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
      {/* Header with Fix All button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Double click to edit cell
        </div>

        {hasAvailableFixes() && (
          <button
            onClick={handleFixAll}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Fix All Errors
          </button>
        )}
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
