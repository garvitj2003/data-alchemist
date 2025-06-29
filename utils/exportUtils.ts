import Papa from "papaparse";
import * as XLSX from "xlsx";
import { parsedFile } from "@/store/uploadAtoms";
import { RulesJSON } from "@/types/rules";

export type ExportFormat = "csv" | "xlsx";

/**
 * Convert data to CSV string
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return "";

  // Handle arrays and objects by stringifying them
  const processedData = data.map((row) => {
    const processedRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      if (Array.isArray(value)) {
        processedRow[key] = value.join(", ");
      } else if (typeof value === "object" && value !== null) {
        processedRow[key] = JSON.stringify(value);
      } else {
        processedRow[key] = value;
      }
    }
    return processedRow;
  });

  return Papa.unparse(processedData);
}

/**
 * Convert data to Excel workbook
 */
export function convertToXLSX(data: Record<string, any>[]): ArrayBuffer {
  if (data.length === 0) {
    // Create empty workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    return XLSX.write(wb, { bookType: "xlsx", type: "array" });
  }

  // Handle arrays and objects by stringifying them
  const processedData = data.map((row) => {
    const processedRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      if (Array.isArray(value)) {
        processedRow[key] = value.join(", ");
      } else if (typeof value === "object" && value !== null) {
        processedRow[key] = JSON.stringify(value);
      } else {
        processedRow[key] = value;
      }
    }
    return processedRow;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(processedData);
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

/**
 * Download a file
 */
export function downloadFile(
  content: string | ArrayBuffer,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export a single file
 */
export function exportSingleFile(
  data: Record<string, any>[],
  filename: string,
  format: ExportFormat
) {
  if (format === "csv") {
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, `${filename}.csv`, "text/csv");
  } else if (format === "xlsx") {
    const xlsxContent = convertToXLSX(data);
    downloadFile(
      xlsxContent,
      `${filename}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }
}

/**
 * Export rules as JSON
 */
export function exportRulesJSON(rules: RulesJSON, prioritizationWeights?: any) {
  // Create a complete rules object with prioritization if provided
  const completeRules = {
    ...rules,
    ...(prioritizationWeights && { prioritization: prioritizationWeights }),
  };

  const jsonContent = JSON.stringify(completeRules, null, 2);
  downloadFile(jsonContent, "rules.json", "application/json");
}

/**
 * Export all files with rules
 */
export function exportAllFiles(
  uploadedFiles: parsedFile[],
  rules: RulesJSON,
  format: ExportFormat = "csv",
  prioritizationWeights?: any
) {
  // Export data files
  uploadedFiles.forEach((file) => {
    const filename = `${file.entityType}_export`;
    exportSingleFile(file.rawData, filename, format);
  });

  // Export rules with prioritization weights
  exportRulesJSON(rules, prioritizationWeights);
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  return format === "csv" ? "csv" : "xlsx";
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: ExportFormat): string {
  return format === "csv"
    ? "text/csv"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}
