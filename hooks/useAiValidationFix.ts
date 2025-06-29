"use client";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { uploadedFilesAtom, validationErrorsAtom } from "@/store/uploadAtoms";
import { fixAllWithAI } from "@/app/actions/fixAllWithAi";
import { EntityType } from "@/store/uploadAtoms";

// The fixed results Gemini gives us
type FixResult = {
  [K in EntityType]?: {
    [rowIndex: number]: Record<string, any>;
  };
};

export function useAIValidationFix() {
  const [uploadedFiles, setUploadedFiles] = useAtom(uploadedFilesAtom);
  const [validationErrors] = useAtom(validationErrorsAtom);

  const [fixes, setFixes] = useState<FixResult>({});
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  // Check if any entity has errors
  useEffect(() => {
    const anyErrors = Object.values(validationErrors).some(
      (entityErrors) => entityErrors && Object.keys(entityErrors).length > 0
    );
    setHasErrors(anyErrors);
  }, [validationErrors]);

  // Run fixAllWithAI and cache result
  const runFix = async () => {
    if (!hasErrors) return;
    setLoading(true);
    console.log("fix called");
    // Transform validationErrors to ensure no undefined values
    const safeValidationErrors = {
      clients: validationErrors.clients || {},
      workers: validationErrors.workers || {},
      tasks: validationErrors.tasks || {},
    };

    const res = await fixAllWithAI({
      uploadedFiles,
      validationErrors: safeValidationErrors,
    });

    setFixes(res);
    setLoading(false);
  };

  // Call this from UI to apply fix to a specific cell
  const fixCell = (entity: EntityType, rowIndex: number, field: string) => {
    const rowFix = fixes?.[entity]?.[rowIndex];
    if (!rowFix || !(field in rowFix)) return;

    const fixedValue = rowFix[field];

    setUploadedFiles((prev) =>
      prev.map((file) => {
        if (file.entityType !== entity) return file;

        const updatedData = [...file.rawData];
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [field]: fixedValue,
        };

        return {
          ...file,
          rawData: updatedData,
        };
      })
    );
  };

  return {
    hasErrors,
    runFix,
    fixes,
    fixCell,
    loading,
  };
}
