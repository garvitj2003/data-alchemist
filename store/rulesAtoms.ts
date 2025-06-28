import { RulesJSON } from "@/types/rules";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const rulesAtom = atomWithStorage<RulesJSON>("rules", {
    coRun: [],
    slotRestriction: [],
    loadLimit: [],
    phaseWindow: [],
    precedence: []
  });
  