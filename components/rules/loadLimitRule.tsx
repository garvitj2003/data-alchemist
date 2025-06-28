"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
import MultiSelect  from "@/components/custom/multiSelect"; // Assuming you made this for CoRun
import { useAtomValue } from "jotai";
import { uploadedFilesAtom } from "@/store/uploadAtoms";

export default function LoadLimitRuleForm() {
  const setRules = useSetAtom(rulesAtom);
  const uploadedFiles = useAtomValue(uploadedFilesAtom);

  // Fetch available Worker IDs from uploaded files
  const workerFile = uploadedFiles.find((f) => f.entityType === "workers");
  const workerIDs: string[] =
    workerFile?.rawData.map((row) => row.WorkerID) ?? [];
    const workerOptions = workerIDs.map((id) => ({
        label: id,
        value: id,
      }));
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [maxSlotsPerPhase, setMaxSlotsPerPhase] = useState(1);

  const handleAddRule = () => {
    if (selectedWorkers.length === 0 || maxSlotsPerPhase < 1) return;

    const newRule = {
      group: selectedWorkers,
      maxSlotsPerPhase,
    };

    setRules((prev) => ({
      ...prev,
      loadLimit: [...prev.loadLimit, newRule],
    }));

    // Reset
    setSelectedWorkers([]);
    setMaxSlotsPerPhase(1);
  };

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Load Limit Rule</h3>

      <MultiSelect
        options={workerOptions}
        value={selectedWorkers}
        onChange={setSelectedWorkers}
        placeholder="Select workers for load limit"
      />

      <Input
        type="number"
        min={1}
        value={maxSlotsPerPhase}
        onChange={(e) => setMaxSlotsPerPhase(Number(e.target.value))}
        placeholder="Max tasks per phase"
      />

      <Button onClick={handleAddRule}>Add Rule</Button>
    </div>
  );
}
