import { parsedFile } from "@/store/uploadAtoms";
import { clientSchema, workerSchema, taskSchema } from "@/validators/schemas";

export function validateAllFiles(files: parsedFile[]): boolean {
  try {
    for (const { entityType, rawData } of files) {
      let schema;
      if (entityType === "clients") schema = clientSchema;
      if (entityType === "workers") schema = workerSchema;
      if (entityType === "tasks") schema = taskSchema;
      if (!schema) throw new Error("Unknown schema");

      rawData.forEach((row) => {
        schema.parse(row);
      });
    }
    return true;
  } catch (e) {
    console.error("Validation error:", e);
    return false;
  }
}
