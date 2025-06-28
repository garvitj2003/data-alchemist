import {
  parsedFile,
  EntityType,
  ValidationErrors,
  RowErrorMap,
} from "@/store/uploadAtoms";
import { normalizeRowTypes } from "@/utils/normalizeData";
import { clientSchema, workerSchema, taskSchema } from "@/validators/schemas";
import { z } from "zod";
import { checkDuplicateIDs } from "./checkDuplicateIDs";

// Map entityType to its Zod schema
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

// validateAllFiles (Global validation)
export function validateAllFiles(files: parsedFile[]): ValidationErrors {
  const allErrors: ValidationErrors = {};

  // Step 1: Validate field-level schema
  for (const { entityType, rawData } of files) {
    const schema = getSchemaForEntity(entityType);
    if (!schema) continue;

    const entityErrors: RowErrorMap = {};

    rawData.forEach((rawRow, rowIndex) => {
      const normalized = normalizeRowTypes(entityType, rawRow);
      const result = schema.safeParse(normalized);

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

  for (const file of files) {
    const { entityType, rawData } = file;

    // Determine ID field per entity
    const idField =
      entityType === "clients"
        ? "ClientID"
        : entityType === "workers"
        ? "WorkerID"
        : "TaskID";

    const duplicates = checkDuplicateIDs(rawData, idField);

    if (!allErrors[entityType]) allErrors[entityType] = {};
    for (const rowIndex in duplicates) {
      const idx = parseInt(rowIndex);
      allErrors[entityType][idx] = {
        ...allErrors[entityType][idx],
        ...duplicates[rowIndex],
      };
    }
  }

  // Cross-entity validation
  const crossErrors = validateCrossEntityRelations(files);

  // Merge cross-entity errors into field errors
  for (const entityType in crossErrors) {
    if (!allErrors[entityType as EntityType]) {
      allErrors[entityType as EntityType] = {};
    }
    const entityErrors = crossErrors[entityType as EntityType]!;
    for (const rowIndex in entityErrors) {
      const rowIdx = parseInt(rowIndex);
      allErrors[entityType as EntityType]![rowIdx] = {
        ...allErrors[entityType as EntityType]![rowIdx],
        ...entityErrors[rowIdx],
      };
    }
  }

  return allErrors;
}

// validateSingleRow (for cell edit)
export function validateSingleRow(
  entity: EntityType,
  rawRow: Record<string, any>,
  allFiles?: parsedFile[]
): Record<string, string> {
  const normalizedRow = normalizeRowTypes(entity, rawRow);
  const schema = getSchemaForEntity(entity);
  const errors: Record<string, string> = {};

  // Field-level validation
  if (schema) {
    const result = schema.safeParse(normalizedRow);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors[issue.path[0] as string] = issue.message;
      }
    }
  }
  // Cross-entity validation for this single row (if files provided)
  if (
    allFiles &&
    (entity === "clients" || entity === "tasks" || entity === "workers")
  ) {
    const crossErrors = validateSingleRowCrossRelations(
      entity,
      normalizedRow,
      allFiles
    );
    Object.assign(errors, crossErrors);
  }

  return errors;
}

//  Cross-entity validator (ALL rows)

export function validateCrossEntityRelations(
  files: parsedFile[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  const clients = files.find((f) => f.entityType === "clients")?.rawData ?? [];
  const tasks = files.find((f) => f.entityType === "tasks")?.rawData ?? [];
  const workers = files.find((f) => f.entityType === "workers")?.rawData ?? [];

  const taskIDs = new Set(tasks.map((t) => t.TaskID));
  const workerSkills = new Set(workers.flatMap((w) => w.Skills));
  const validPhases = new Set([1, 2, 3, 4, 5, 6]); // Define your actual phases if needed

  // Clients - Tasks: Check RequestedTaskIDs
  clients.forEach((client, rowIdx) => {
    const errorsForRow: Record<string, string> = {};
    for (const taskId of client.RequestedTaskIDs ?? []) {
      if (!taskIDs.has(taskId)) {
        errorsForRow.RequestedTaskIDs = `Task ID "${taskId}" does not exist.`;
        break;
      }
    }
    if (Object.keys(errorsForRow).length) {
      errors["clients"] ??= {};
      errors["clients"][rowIdx] = errorsForRow;
    }
  });

  // Tasks - Workers: RequiredSkills must be covered by at least one worker
  tasks.forEach((task, rowIdx) => {
    const required = task.RequiredSkills ?? [];
    const missing = required.filter(
      (skill: string) => !workerSkills.has(skill)
    );
    if (missing.length > 0) {
      errors["tasks"] ??= {};
      errors["tasks"][rowIdx] = {
        RequiredSkills: `No workers found with skill(s): ${missing.join(", ")}`,
      };
    }
  });

  // Workers - Phases: AvailableSlots must be within valid phase numbers
  workers.forEach((worker, rowIdx) => {
    const invalidSlots = (worker.AvailableSlots ?? []).filter(
      (slot: number) => !validPhases.has(slot)
    );
    if (invalidSlots.length > 0) {
      errors["workers"] ??= {};
      errors["workers"][rowIdx] = {
        AvailableSlots: `Invalid phase slots: ${invalidSlots.join(", ")}`,
      };
    }
  });
  // Workers - Overload check: AvailableSlots.length < MaxLoadPerPhase
  workers.forEach((worker, rowIdx) => {
    const availableSlotCount = (worker.AvailableSlots ?? []).length;
    const maxLoad = worker.MaxLoadPerPhase ?? 0;

    if (availableSlotCount < maxLoad) {
      errors["workers"] ??= {};
      errors["workers"][rowIdx] = {
        ...(errors["workers"]?.[rowIdx] || {}),
        MaxLoadPerPhase: `Worker is overloaded: AvailableSlots (${availableSlotCount}) < MaxLoadPerPhase (${maxLoad})`,
      };
    }
  });

  return errors;
}

// Cross-check for a SINGLE row
function validateSingleRowCrossRelations(
  entity: EntityType,
  row: Record<string, any>,
  files: parsedFile[]
): Record<string, string> {
  const tasks = files.find((f) => f.entityType === "tasks")?.rawData ?? [];
  const workers = files.find((f) => f.entityType === "workers")?.rawData ?? [];
  const clients = files.find((f) => f.entityType === "clients")?.rawData ?? [];

  const taskIDs = new Set(tasks.map((t) => t.TaskID));
  const workerSkills = new Set(workers.flatMap((w) => w.Skills));
  const validPhases = new Set([1, 2, 3, 4, 5, 6]); // Change if needed

  const errors: Record<string, string> = {};

  if (entity === "clients") {
    for (const id of row.RequestedTaskIDs ?? []) {
      if (!taskIDs.has(id)) {
        errors.RequestedTaskIDs = `Task ID "${id}" does not exist.`;
        break;
      }
    }
  }

  if (entity === "tasks") {
    const missingSkills = (row.RequiredSkills ?? []).filter(
      (skill: string) => !workerSkills.has(skill)
    );
    if (missingSkills.length > 0) {
      errors.RequiredSkills = `Missing worker(s) for skills: ${missingSkills.join(
        ", "
      )}`;
    }
  }

  if (entity === "workers") {
    const invalid = (row.AvailableSlots ?? []).filter(
      (slot: number) => !validPhases.has(slot)
    );
    if (invalid.length > 0) {
      errors.AvailableSlots = `Invalid phase slots: ${invalid.join(", ")}`;
    }
    const availableCount = Array.isArray(row.AvailableSlots)
      ? row.AvailableSlots.length
      : 0;

    const maxLoad = Number(row.MaxLoadPerPhase ?? 0);

    if (availableCount < maxLoad) {
      errors.MaxLoadPerPhase = `Worker has only ${availableCount} available slot${
        availableCount !== 1 ? "s" : ""
      }, but MaxLoadPerPhase is ${maxLoad}`;
    }
  }

  return errors;
}
