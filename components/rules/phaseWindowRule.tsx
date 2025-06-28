"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { uploadedFilesAtom } from "@/store/uploadAtoms";
import { rulesAtom } from "@/store/rulesAtoms";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/custom/multiSelect";

export default function PhaseWindowRuleForm() {
  const uploadedFiles = useAtomValue(uploadedFilesAtom);
  const setRules = useSetAtom(rulesAtom);

  const tasks = uploadedFiles.find((f) => f.entityType === "tasks")?.rawData ?? [];
  const taskOptions = tasks.map((task) => ({
    label: task.TaskID,
    value: task.TaskID,
  }));

  const phaseOptions = [1, 2, 3, 4, 5, 6].map((num) => ({
    label: `Phase ${num}`,
    value: String(num),
  }));

  const [selectedTask, setSelectedTask] = useState<string>("");
  const [allowedPhases, setAllowedPhases] = useState<string[]>([]);

  const handleAddRule = () => {
    if (!selectedTask || allowedPhases.length === 0) return;

    const newRule = {
      task: selectedTask,
      allowedPhases: allowedPhases.map((p) => parseInt(p)),
    };

    setRules((prev) => ({
      ...prev,
      phaseWindow: [...prev.phaseWindow, newRule],
    }));

    setSelectedTask("");
    setAllowedPhases([]);
  };

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Phase Window Rule</h3>

      <MultiSelect
        options={taskOptions}
        value={selectedTask ? [selectedTask] : []}
        onChange={(val) => setSelectedTask(val[0])}
        placeholder="Select Task"
      />

      <MultiSelect
        options={phaseOptions}
        value={allowedPhases}
        onChange={setAllowedPhases}
        placeholder="Select allowed phases"
      />

      <Button onClick={handleAddRule}>Add Rule</Button>
    </div>
  );
}
