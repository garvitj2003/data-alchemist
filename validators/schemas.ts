import { z } from "zod";

//  CLIENT SCHEMA
export const clientSchema = z.object({
  ClientID: z.string().min(1, "ClientID is required"),
  ClientName: z.string().min(1, "ClientName is required"),
  PriorityLevel: z.number().min(1).max(5), // You had 1–3, updated to 1–5 as per earlier spec
  RequestedTaskIDs: z
    .array(z.string().min(1))
    .nonempty("At least one TaskID is required"),
  GroupTag: z.string().min(1, "GroupTag is required"),
  AttributesJSON: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON"),
});

// WORKER SCHEMA
export const workerSchema = z.object({
  WorkerID: z.string().min(1),
  WorkerName: z.string().min(1),
  Skills: z.array(z.string().min(1)).nonempty("At least one skill is required"),
  AvailableSlots: z
    .array(z.number().int().min(1))
    .nonempty("At least one slot is required"),
  MaxLoadPerPhase: z.number().min(1),
  WorkerGroup: z.string().min(1),
  QualificationLevel: z.number().min(1),
});

// TASK SCHEMA
export const taskSchema = z.object({
  TaskID: z.string().min(1),
  TaskName: z.string().min(1),
  Category: z.string().min(1),
  Duration: z.number().min(1),
  RequiredSkills: z
    .array(z.string().min(1))
    .nonempty("At least one skill is required"),
  PreferredPhases: z
    .array(z.number().int().min(1))
    .nonempty("At least one preferred phase required"),
  MaxConcurrent: z.number().min(1),
});
