"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import {
  uploadedFilesAtom,
  EntityType,
  parsedFile,
  validationErrorsAtom,
  aiModificationsAtom,
} from "@/store/uploadAtoms";
import { modifyTable } from "@/app/actions/dataModification";
import { validateSingleRow } from "@/lib/validators";
import { normalizeRowTypes } from "@/utils/normalizeData";

export function useAIModifyTable(entity: EntityType) {
  const [uploadedFiles, setUploadedFiles] = useAtom(uploadedFilesAtom);
  const [validationErrors, setValidationErrors] = useAtom(validationErrorsAtom);
  const [aiModifications, setAIModifications] = useAtom(aiModificationsAtom);
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<
    number,
    Record<string, any>
  > | null>(null);

  const runAIModification = async (userPrompt: string) => {
    setLoading(true);
    setAiMessage(null);
    setPendingChanges(null);

    const entityFile = uploadedFiles.find((f) => f.entityType === entity);
    if (!entityFile || !entityFile.rawData) {
      setAiMessage("No data found for entity.");
      setLoading(false);
      return;
    }

    const result = await modifyTable({
      entity,
      prompt: userPrompt,
      data: entityFile.rawData,
    });

    setAiMessage(result.message);
    setPendingChanges(result.changes);
    setLoading(false);
  };

  const applyChanges = () => {
    if (!pendingChanges) return;

    // Track AI modifications
    setAIModifications((prev) => {
      const newAIModifications = { ...prev };

      if (!newAIModifications[entity]) {
        newAIModifications[entity] = {};
      }

      Object.entries(pendingChanges).forEach(([rowIndexStr, updatedFields]) => {
        const rowIndex = parseInt(rowIndexStr);

        if (!newAIModifications[entity]![rowIndex]) {
          newAIModifications[entity]![rowIndex] = {};
        }

        // Mark each modified field as AI-modified
        Object.keys(updatedFields).forEach((fieldName) => {
          newAIModifications[entity]![rowIndex][fieldName] = true;
        });
      });

      return newAIModifications;
    });

    // Apply changes to uploaded files
    setUploadedFiles((prev) =>
      prev.map((file) => {
        if (file.entityType !== entity) return file;

        const updatedData = [...file.rawData];
        Object.entries(pendingChanges).forEach(
          ([rowIndexStr, updatedFields]) => {
            const rowIndex = parseInt(rowIndexStr);
            const originalRow = updatedData[rowIndex];
            const updatedRow = {
              ...originalRow,
              ...updatedFields,
            };

            // Normalize the updated row
            updatedData[rowIndex] = normalizeRowTypes(entity, updatedRow);
          }
        );

        return {
          ...file,
          rawData: updatedData,
          // TODO: Add metadata tracking for AI modifications
        };
      })
    );

    // Run validation for all changed rows
    const entityFile = uploadedFiles.find((f) => f.entityType === entity);
    if (entityFile) {
      Object.keys(pendingChanges).forEach((rowIndexStr) => {
        const rowIndex = parseInt(rowIndexStr);
        const updatedFields = pendingChanges[rowIndex];
        const originalRow = entityFile.rawData[rowIndex];
        const updatedRow = normalizeRowTypes(entity, {
          ...originalRow,
          ...updatedFields,
        });

        // Validate the updated row
        const rowErrors = validateSingleRow(entity, updatedRow, uploadedFiles);

        // Update validation errors
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };

          if (!newErrors[entity]) {
            newErrors[entity] = {};
          }

          if (Object.keys(rowErrors).length === 0) {
            // No errors - remove this row's errors
            if (newErrors[entity]![rowIndex]) {
              delete newErrors[entity]![rowIndex];
            }
          } else {
            // Has errors - set new errors for this row
            newErrors[entity]![rowIndex] = rowErrors;
          }

          // Clean up empty entity errors
          if (
            newErrors[entity] &&
            Object.keys(newErrors[entity]).length === 0
          ) {
            delete newErrors[entity];
          }

          return newErrors;
        });
      });
    }

    // Clear pending after applying
    setPendingChanges(null);
    setAiMessage(aiMessage + " ✅ Changes applied successfully!");
  };

  const rejectChanges = () => {
    setPendingChanges(null);
    setAiMessage(null);
  };

  const applyIndividualChange = (rowIndex: number, columnKey: string) => {
    if (
      !pendingChanges ||
      !pendingChanges[rowIndex] ||
      !pendingChanges[rowIndex][columnKey]
    ) {
      return;
    }

    const changeValue = pendingChanges[rowIndex][columnKey];

    // Track this individual AI modification
    setAIModifications((prev) => {
      const newAIModifications = { ...prev };

      if (!newAIModifications[entity]) {
        newAIModifications[entity] = {};
      }

      if (!newAIModifications[entity]![rowIndex]) {
        newAIModifications[entity]![rowIndex] = {};
      }

      // Mark this field as AI-modified
      newAIModifications[entity]![rowIndex][columnKey] = true;

      return newAIModifications;
    });

    // Apply the individual change to the uploaded files
    setUploadedFiles((prev) =>
      prev.map((file) => {
        if (file.entityType !== entity) return file;

        const updatedData = [...file.rawData];
        const updatedRow = {
          ...updatedData[rowIndex],
          [columnKey]: changeValue,
        };
        updatedData[rowIndex] = normalizeRowTypes(entity, updatedRow);

        return {
          ...file,
          rawData: updatedData,
        };
      })
    );

    // Remove this specific change from pending
    setPendingChanges((prev) => {
      if (!prev) return null;

      const newPending = { ...prev };
      if (newPending[rowIndex]) {
        delete newPending[rowIndex][columnKey];

        // If no more changes for this row, remove the row
        if (Object.keys(newPending[rowIndex]).length === 0) {
          delete newPending[rowIndex];
        }
      }

      // If no more changes at all, return null
      return Object.keys(newPending).length > 0 ? newPending : null;
    });
  };

  return {
    runAIModification,
    applyChanges,
    rejectChanges,
    applyIndividualChange,
    loading,
    aiMessage,
    hasChanges: !!pendingChanges,
    pendingChanges,
  };
}
