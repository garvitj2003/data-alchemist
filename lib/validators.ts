import {
  parsedFile,
  EntityType,
  ValidationErrors,
  RowErrorMap,
} from "@/store/uploadAtoms";
import { normalizeRowTypes } from "@/utils/normalizeData";
import { clientSchema, workerSchema, taskSchema } from "@/validators/schemas";
import { z } from "zod";

// Helper: Map entityType to its corresponding schema
const getSchemaForEntity = (
  entityType: EntityType
): z.ZodSchema | undefined => {
  switch (entityType) {
    case "clients":
      return clientSchema;
    case "workers":
      return workerSchema;
    case "tasks":
      return taskSchema;
    default:
      return undefined;
  }
};

// Validate all rows from all files (used on "Validate & Continue")
export function validateAllFiles(files: parsedFile[]): ValidationErrors {
  const allErrors: ValidationErrors = {};

  for (const { entityType, rawData } of files) {
    const schema = getSchemaForEntity(entityType);
    if (!schema) continue;

    const entityErrors: RowErrorMap = {};

    rawData.forEach((rawRow, rowIndex) => {
      const normalizedRow = normalizeRowTypes(entityType, rawRow); // 🧠 Normalize BEFORE validating
      const result = schema.safeParse(normalizedRow);

      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          const message = issue.message;

          if (!entityErrors[rowIndex]) entityErrors[rowIndex] = {};
          entityErrors[rowIndex][field] = message;
        }
      }
    });

    if (Object.keys(entityErrors).length > 0) {
      allErrors[entityType] = entityErrors;
    }
  }

  return allErrors;
}

// Validate a single row (used on cell edit or row update)
export function validateSingleRow(
  entity: EntityType,
  rawRow: Record<string, any>
): Record<string, string> {
  const normalizedRow = normalizeRowTypes(entity, rawRow);
  const schema = getSchemaForEntity(entity);
  if (!schema) return {};

  const result = schema.safeParse(normalizedRow);

  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      errors[field] = issue.message;
    }
  }

  return errors;
}
