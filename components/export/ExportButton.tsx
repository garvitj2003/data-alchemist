"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadedFilesAtom } from "@/store/uploadAtoms";
import { rulesAtom } from "@/store/rulesAtoms";
import { prioritizationWeightsAtom } from "@/store/prioritizationAtom";
import { exportAllFiles, ExportFormat } from "@/utils/exportUtils";
import { Download, FileSpreadsheet, FileText, Package } from "lucide-react";

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const uploadedFiles = useAtomValue(uploadedFilesAtom);
  const rules = useAtomValue(rulesAtom);
  const prioritizationWeights = useAtomValue(prioritizationWeightsAtom);

  const hasData = uploadedFiles.length > 0;

  // Count total rules
  const totalRules = Object.values(rules).reduce((sum, ruleArray) => {
    return sum + (Array.isArray(ruleArray) ? ruleArray.length : 0);
  }, 0);

  const handleExport = async (format: ExportFormat) => {
    if (!hasData) return;

    setIsExporting(true);

    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      exportAllFiles(uploadedFiles, rules, format, prioritizationWeights);

      // Show success message briefly
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
    }
  };

  if (!hasData) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Download className="w-4 h-4" />
        Export Data
        <Badge variant="secondary" className="ml-1 text-xs">
          No Data
        </Badge>
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">
          {uploadedFiles.length} files
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {totalRules} rules
        </Badge>
      </div>

      <Button
        onClick={() => handleExport("csv")}
        className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
        disabled={isExporting}
        size="sm"
      >
        {isExporting ? (
          <>
            <Package className="w-4 h-4 animate-pulse" />
            Exporting...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Export CSV
          </>
        )}
      </Button>

      <Button
        onClick={() => handleExport("xlsx")}
        className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        disabled={isExporting}
        size="sm"
      >
        {isExporting ? (
          <>
            <Package className="w-4 h-4 animate-pulse" />
            Exporting...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </>
        )}
      </Button>
    </div>
  );
}
