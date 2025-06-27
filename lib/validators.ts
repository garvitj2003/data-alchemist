import { parsedFile, EntityType, ValidationErrors } from "@/store/uploadAtoms";
import { clientSchema, workerSchema, taskSchema } from "@/validators/schemas";
import { z } from "zod";

export function validateAllFiles(files: parsedFile[]): ValidationErrors {
  const allErrors: ValidationErrors = {};

  for (const { entityType, rawData } of files) {
    let schema: z.ZodSchema | undefined;

    if (entityType === "clients") schema = clientSchema;
    if (entityType === "workers") schema = workerSchema;
    if (entityType === "tasks") schema = taskSchema;
    if (!schema) continue;

    const entityErrors: Record<number, Record<string, string>> = {};

    rawData.forEach((row, rowIndex) => {
      const result = schema.safeParse(row);
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
