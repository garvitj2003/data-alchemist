import { get } from "http";
import { atom } from "jotai";

export type EntityType = "clients" | "workers" | "tasks";

export type parsedFile = {
  fileName: string;
  entityType: EntityType;
  rawData: any[];
};
export const uploadedFilesAtom = atom<parsedFile[]>([]);

export const validationReadyAtom = atom((get) => {
  const files = get(uploadedFilesAtom);
  const typesUploaded = new Set(files.map((f) => f.entityType));
  return (["clients", "workers", "tasks"] as EntityType[]).every((t) =>
    typesUploaded.has(t)
  );
});
export type CellErrorMap = {
  [fieldName: string]: string; // e.g., "Duration": "Must be ≥ 1"
};

export type RowErrorMap = {
  [rowIndex: number]: CellErrorMap;
};

export type ValidationErrors = {
  [entity in EntityType]?: RowErrorMap;
};

export const validationErrorsAtom = atom<ValidationErrors>({});
