import { parsedFile, EntityType, ValidationErrors } from "@/store/uploadAtoms";

// Utility to ensure value is a number and >= 1
const isValidPhaseNumber = (val: any) => {
  const num = Number(val);
  return !isNaN(num) && Number.isInteger(num) && num >= 1;
};

export function validateCrossEntityRelations(files: parsedFile[]): ValidationErrors {
  const errors: ValidationErrors = {};

  const clients = files.find((f) => f.entityType === "clients")?.rawData || [];
  const tasks = files.find((f) => f.entityType === "tasks")?.rawData || [];
  const workers = files.find((f) => f.entityType === "workers")?.rawData || [];

  const taskIDs = new Set(tasks.map((t) => t.TaskID));
  const workerSkills = new Set(
    workers.flatMap((w) => w.Skills || []).map((skill: string) => skill.trim())
  );

  const availablePhases = new Set<number>();
  workers.forEach((w) => {
    if (Array.isArray(w.AvailableSlots)) {
      w.AvailableSlots.forEach((slot: any) => {
        if (isValidPhaseNumber(slot)) availablePhases.add(Number(slot));
      });
    }
  });

  //  Clients → Tasks: Check if RequestedTaskIDs exist in tasks
  clients.forEach((client, rowIdx) => {
    const requestedIDs: string[] = Array.isArray(client.RequestedTaskIDs)
      ? client.RequestedTaskIDs
      : [];

    for (const taskId of requestedIDs) {
      if (!taskIDs.has(taskId)) {
        if (!errors["clients"]) errors["clients"] = {};
        if (!errors["clients"]![rowIdx]) errors["clients"]![rowIdx] = {};
        errors["clients"]![rowIdx]!["RequestedTaskIDs"] = `Task ID "${taskId}" not found in tasks`;
        break;
      }
    }
  });

  // Tasks → Workers: Every RequiredSkill should be covered by at least one worker
  tasks.forEach((task, rowIdx) => {
    const requiredSkills: string[] = Array.isArray(task.RequiredSkills)
      ? task.RequiredSkills
      : [];

    for (const skill of requiredSkills) {
      if (!workerSkills.has(skill)) {
        if (!errors["tasks"]) errors["tasks"] = {};
        if (!errors["tasks"]![rowIdx]) errors["tasks"]![rowIdx] = {};
        errors["tasks"]![rowIdx]!["RequiredSkills"] = `Skill "${skill}" has no available worker`;
        break;
      }
    }
  });

  //  Workers → Phases: AvailableSlots should contain valid phase numbers
  workers.forEach((worker, rowIdx) => {
    const slots: any[] = Array.isArray(worker.AvailableSlots) ? worker.AvailableSlots : [];

    const invalidSlots = slots.filter((slot) => !isValidPhaseNumber(slot));
    if (invalidSlots.length > 0) {
      if (!errors["workers"]) errors["workers"] = {};
      if (!errors["workers"]![rowIdx]) errors["workers"]![rowIdx] = {};
      errors["workers"]![rowIdx]!["AvailableSlots"] = `Invalid phase(s): ${invalidSlots.join(", ")}`;
    }
  });

  return errors;
}
