import { EntityType } from "@/store/uploadAtoms";

export function normalizeRowTypes(
  entityType: EntityType,
  row: Record<string, any>
) {
  const normalized = { ...row };

  if (entityType === "clients") {
    normalized.PriorityLevel = Number(row.PriorityLevel);
    normalized.RequestedTaskIDs =
      typeof row.RequestedTaskIDs === "string"
        ? row.RequestedTaskIDs.split(",").map((id) => id.trim())
        : row.RequestedTaskIDs;
  }

  if (entityType === "workers") {
    normalized.Skills =
      typeof row.Skills === "string"
        ? row.Skills.split(",").map((s) => s.trim())
        : row.Skills;

    normalized.MaxLoadPerPhase = Number(row.MaxLoadPerPhase);
    normalized.QualificationLevel = Number(row.QualificationLevel);

    try {
      if (typeof row.AvailableSlots === "string") {
        if (row.AvailableSlots.startsWith("["))
          normalized.AvailableSlots = JSON.parse(row.AvailableSlots);
        else
          normalized.AvailableSlots = row.AvailableSlots.split(",").map(
            (p: string) => Number(p.trim())
          );
      }
    } catch {
      normalized.AvailableSlots = "__INVALID__";
    }
  }

  if (entityType === "tasks") {
    normalized.Duration = Number(row.Duration);
    normalized.MaxConcurrent = Number(row.MaxConcurrent);

    normalized.RequiredSkills =
      typeof row.RequiredSkills === "string"
        ? row.RequiredSkills.split(",").map((s) => s.trim())
        : row.RequiredSkills;

    try {
      if (typeof row.PreferredPhases === "string") {
        if (row.PreferredPhases.includes("-")) {
          const [start, end] = row.PreferredPhases.split("-").map(Number);
          normalized.PreferredPhases = Array.from(
            { length: end - start + 1 },
            (_, i) => start + i
          );
        } else if (row.PreferredPhases.startsWith("[")) {
          normalized.PreferredPhases = JSON.parse(row.PreferredPhases);
        } else {
          normalized.PreferredPhases = row.PreferredPhases.split(",").map(
            (p: string) => Number(p.trim())
          );
        }
      }
    } catch {
      normalized.PreferredPhases = "__INVALID__";
    }
  }

  return normalized;
}
