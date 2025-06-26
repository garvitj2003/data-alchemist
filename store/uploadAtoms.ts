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
