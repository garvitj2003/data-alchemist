import { EntityType } from "@/store/uploadAtoms";


export function normalizeRowTypes(entityType: EntityType, row: Record<string, any>) {
  const normalized = { ...row };

  if (entityType === "clients") {
    normalized.PriorityLevel = Number(row.PriorityLevel);
    // Add others if needed
  }

  if (entityType === "tasks") {
    normalized.Duration = Number(row.Duration);
    normalized.MaxConcurrent = Number(row.MaxConcurrent);
    // normalize PreferredPhases, RequiredSkills if needed
  }

  if (entityType === "workers") {
    normalized.MaxLoadPerPhase = Number(row.MaxLoadPerPhase);
    // normalize AvailableSlots array if it's stringified
  }

  return normalized;
}
