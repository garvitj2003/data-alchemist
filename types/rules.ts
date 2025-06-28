export type RulesJSON = {
  coRun: { tasks: string[] }[];
  slotRestriction: { group: string[]; minCommonSlots: number }[];
  loadLimit: { group: string[]; maxSlotsPerPhase: number }[];
  phaseWindow: { task: string; allowedPhases: number[] }[];
  precedence: { ruleA: string; ruleB: string; priority: "high" | "low" }[];
  prioritization?: {
    PriorityLevel: number;
    RequestedTaskIDs: number;
    Fairness: number;
  };
};
