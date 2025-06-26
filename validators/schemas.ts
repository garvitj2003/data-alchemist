import { z } from "zod";

export const clientSchema = z.object({
  ClientID: z.string(),
  ClientName: z.string(),
  PriorityLevel: z.any(),
  RequestedTaskIDs: z.string(), // we'll split this later
  GroupTag: z.string(),
  AttributesJSON: z.any(),
});

export const workerSchema = z.object({
  WorkerID: z.string(),
  WorkerName: z.string(),
  Skills: z.string(),
  AvailableSlots: z.any(),
  WorkerGroup: z.string(),
  QualificationLevel: z.string().optional(),
});

export const taskSchema = z.object({
  TaskID: z.string(),
  TaskName: z.string(),
  Category: z.string(),
  Duration: z.any(),
  RequiredSkills: z.string(),
  PreferredPhases: z.string(),
  MaxConcurrent: z.any(),
});
