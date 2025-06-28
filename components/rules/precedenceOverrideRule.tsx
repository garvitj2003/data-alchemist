"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAtomValue, useSetAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";

// Temporary: Extract rule identifiers from rulesAtom
function useRuleIdentifiers() {
  const rules = useAtomValue(rulesAtom);
  const ids: string[] = [];

  rules.coRun.forEach((r) => ids.push(`coRun:${r.tasks.join(",")}`));
  rules.slotRestriction.forEach((r) => ids.push(`slotRestriction:${r.group.join(",")}`));
  rules.loadLimit.forEach((r) => ids.push(`loadLimit:${r.group.join(",")}`));
  rules.phaseWindow.forEach((r) => ids.push(`phaseWindow:${r.task}`));

  return ids;
}

export default function PrecedenceOverrideRuleForm() {
  const ruleOptions = useRuleIdentifiers();
  const setRules = useSetAtom(rulesAtom);

  const [ruleA, setRuleA] = useState("");
  const [ruleB, setRuleB] = useState("");
  const [priority, setPriority] = useState<"high" | "low">("high");

  const handleAddRule = () => {
    if (!ruleA || !ruleB || ruleA === ruleB) return;

    setRules((prev) => ({
      ...prev,
      precedence: [...prev.precedence, { ruleA, ruleB, priority }],
    }));

    // Reset
    setRuleA("");
    setRuleB("");
    setPriority("high");
  };

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Precedence Override Rule</h3>

      <Select value={ruleA} onValueChange={setRuleA}>
        <SelectTrigger>
          <SelectValue placeholder="Select Rule A" />
        </SelectTrigger>
        <SelectContent>
          {ruleOptions.map((id) => (
            <SelectItem key={id} value={id}>
              {id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={ruleB} onValueChange={setRuleB}>
        <SelectTrigger>
          <SelectValue placeholder="Select Rule B" />
        </SelectTrigger>
        <SelectContent>
          {ruleOptions.map((id) => (
            <SelectItem key={id} value={id}>
              {id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(val) => setPriority(val as "high" | "low")}>
        <SelectTrigger>
          <SelectValue placeholder="Select Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">Prefer Rule A</SelectItem>
          <SelectItem value="low">Prefer Rule B</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleAddRule}>Add Rule</Button>
    </div>
  );
}
