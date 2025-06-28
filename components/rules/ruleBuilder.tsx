"use client";
import { rulesAtom } from "@/store/rulesAtoms";
import CoRunRule from "./coRunRule";
import { useAtomValue } from "jotai";
import { useState } from "react";
import SlotRestrictionRuleForm from "./slotRestrictionRule";
import LoadLimitRuleForm from "./loadLimitRule";
import PhaseWindowRuleForm from "./phaseWindowRule";
import PrecedenceOverrideRuleForm from "./precedenceOverrideRule";

export default function RuleBuilder() {
  const [selectedType, setSelectedType] = useState<"coRun" | null>("coRun"); // just coRun for now

  return (
    <div className="space-y-6">
      {/* Dropdown coming later */}
      <CoRunRule />
      <SlotRestrictionRuleForm />
      <LoadLimitRuleForm />
      <PhaseWindowRuleForm />
      <PrecedenceOverrideRuleForm />
      <pre className="bg-black text-white p-4 rounded-md">
        {JSON.stringify(useAtomValue(rulesAtom), null, 2)}
      </pre>
    </div>
  );
}
