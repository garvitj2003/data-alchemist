import { atom } from "jotai";

export const prioritizationWeightsAtom = atom<{
  PriorityLevel: number;
  RequestedTaskIDs: number;
  Fairness: number;
  PrefferedPhases: number;
}>({
  PriorityLevel: 0.4,
  RequestedTaskIDs: 0.3,
  PrefferedPhases: 0.2,
  Fairness: 0.1,
});