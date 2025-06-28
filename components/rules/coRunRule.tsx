"use client";

import { useAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
import { uploadedFilesAtom } from "@/store/uploadAtoms";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/custom/multiSelect"; // optional: or use checkboxes

export default function CoRunRule() {
  const [rules, setRules] = useAtom(rulesAtom);
  const [files] = useAtom(uploadedFilesAtom);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const taskFile = files.find((f) => f.entityType === "tasks");
  const taskOptions =
    taskFile?.rawData.map((task) => ({
      label: task.TaskID,
      value: task.TaskID,
    })) || [];

  const handleAddRule = () => {
    if (selectedTasks.length < 2) return;

    setRules((prev) => ({
      ...prev,
      coRun: [...prev.coRun, { tasks: selectedTasks }],
    }));

    setSelectedTasks([]); // Reset
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="font-semibold">Co-run Rule</h3>

      <MultiSelect
        options={taskOptions}
        value={selectedTasks}
        onChange={setSelectedTasks}
        placeholder="Select 2 or more TaskIDs"
      />

      <Button onClick={handleAddRule} disabled={selectedTasks.length < 2}>
        Add Co-run Rule
      </Button>
    </div>
  );
}
