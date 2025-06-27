import { z } from "zod";

export const clientSchema = z.object({
  ClientID: z.string(),
  ClientName: z.string(),
  PriorityLevel: z.number().min(1).max(3),
  RequestedTaskIDs: z.string(), // we'll split this later
  GroupTag: z.string(),
  AttributesJSON: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON"),
});

export const workerSchema = z.object({
  WorkerID: z.string(),
  WorkerName: z.string(),
  Skills: z.string(),
  AvailableSlots: z.string(), // parse to array later
  MaxLoadPerPhase: z.number().min(1),
  WorkerGroup: z.string(),
  QualificationLevel: z.string().optional(),
});

export const taskSchema = z.object({
  TaskID: z.string(),
  TaskName: z.string(),
  Category: z.string(),
  Duration: z.number().min(1),
  RequiredSkills: z.string(),
  PreferredPhases: z.string(),
  MaxConcurrent: z.number().min(1),
});
