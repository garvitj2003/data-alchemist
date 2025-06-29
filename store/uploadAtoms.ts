import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type EntityType = "clients" | "workers" | "tasks";

export type parsedFile = {
  fileName: string;
  entityType: EntityType;
  rawData: Record<string, any>[]; // safer than 'any[]'
};

export type CellErrorMap = {
  [fieldName: string]: string; // e.g., "Duration": "Must be ≥ 1"
};

export type RowErrorMap = {
  [rowIndex: number]: CellErrorMap;
};

export type ValidationErrors = {
  [entity in EntityType]?: RowErrorMap;
};

// AI modifications tracking
export type AIModificationMap = {
  [rowIndex: number]: {
    [fieldName: string]: boolean; // true = modified by AI
  };
};

export type AIModifications = {
  [entity in EntityType]?: AIModificationMap;
};

export const uploadedFilesAtom = atomWithStorage<parsedFile[]>(
  "uploaded-files",
  []
);

export const validationErrorsAtom = atomWithStorage<ValidationErrors>(
  "validation-errors",
  {}
);

// Track AI modifications
export const aiModificationsAtom = atomWithStorage<AIModifications>(
  "ai-modifications",
  {}
);

export const validationReadyAtom = atom((get) => {
  const files = get(uploadedFilesAtom);
  const typesUploaded = new Set(files.map((f) => f.entityType));
  return (["clients", "workers", "tasks"] as EntityType[]).every((t) =>
    typesUploaded.has(t)
  );
});
