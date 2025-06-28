import { RowErrorMap } from "@/store/uploadAtoms";

export function checkDuplicateIDs(
  data: Record<string, any>[],
  idField: string
): RowErrorMap {
  const seen = new Map<string, number>();
  const duplicates: RowErrorMap = {};

  data.forEach((row, index) => {
    const id = row[idField];
    if (seen.has(id)) {
      const firstIndex = seen.get(id)!;

      // Mark both first occurrence and current duplicate
      duplicates[firstIndex] = {
        ...duplicates[firstIndex],
        [idField]: `Duplicate ${idField} found`,
      };
      duplicates[index] = {
        ...duplicates[index],
        [idField]: `Duplicate ${idField} found`,
      };
    } else {
      seen.set(id, index);
    }
  });

  return duplicates;
}
