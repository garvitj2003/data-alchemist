"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
export default function SlotRestrictionRuleForm() {
  const setRules = useSetAtom(rulesAtom);

  const [groupType, setGroupType] = useState<"ClientGroup" | "WorkerGroup">(
    "WorkerGroup"
  );
  const [groupId, setGroupId] = useState("");
  const [minCommonSlots, setMinCommonSlots] = useState(1);

  const handleAddRule = () => {
    const newRule = {
      group: [groupId],
      minCommonSlots,
    };

    setRules((prev) => ({
      ...prev,
      slotRestriction: [...prev.slotRestriction, newRule],
    }));
    // Reset state
    setGroupId("");
    setMinCommonSlots(1);
  };

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Slot Restriction Rule</h3>

      <Select
        value={groupType}
        onValueChange={(val) => setGroupType(val as any)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select group type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="WorkerGroup">Worker Group</SelectItem>
          <SelectItem value="ClientGroup">Client Group</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        placeholder="Enter group ID or name"
      />

      <Input
        type="number"
        min={1}
        value={minCommonSlots}
        onChange={(e) => setMinCommonSlots(Number(e.target.value))}
        placeholder="Minimum common slots"
      />

      <Button onClick={handleAddRule}>Add Rule</Button>
    </div>
  );
}
