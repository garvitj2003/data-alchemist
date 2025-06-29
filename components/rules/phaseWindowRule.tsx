"use client";

import { useState } from "react";
import { useAtomValue, useAtom } from "jotai";
import { uploadedFilesAtom } from "@/store/uploadAtoms";
import { rulesAtom } from "@/store/rulesAtoms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Check, AlertCircle, X } from "lucide-react";

export default function PhaseWindowRuleForm() {
  const uploadedFiles = useAtomValue(uploadedFilesAtom);
  const [rules, setRules] = useAtom(rulesAtom);

  const tasks =
    uploadedFiles.find((f) => f.entityType === "tasks")?.rawData ?? [];
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
  const [currentPhase, setCurrentPhase] = useState<string>("");

  const availablePhaseOptions = phaseOptions.filter(
    (phase) => !allowedPhases.includes(phase.value)
  );

  const handleAddPhase = (phaseId: string) => {
    if (phaseId && !allowedPhases.includes(phaseId)) {
      setAllowedPhases([...allowedPhases, phaseId]);
      setCurrentPhase("");
    }
  };

  const handleRemovePhase = (phaseId: string) => {
    setAllowedPhases(allowedPhases.filter((id) => id !== phaseId));
  };

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

  const handleRemoveRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      phaseWindow: prev.phaseWindow.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Select Task
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose a task to restrict to specific phases
              </p>

              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task..." />
                </SelectTrigger>
                <SelectContent>
                  {taskOptions.map((task) => (
                    <SelectItem key={task.value} value={task.value}>
                      {task.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {taskOptions.length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  No tasks available. Please upload task data first.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Allowed Phases</Label>
              <p className="text-sm text-muted-foreground">
                Select which phases this task can be scheduled in
              </p>

              <Select value={currentPhase} onValueChange={handleAddPhase}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a phase to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePhaseOptions.map((phase) => (
                    <SelectItem key={phase.value} value={phase.value}>
                      {phase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Phases Display */}
              {allowedPhases.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Selected Phases:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {allowedPhases.map((phaseId) => (
                      <Badge
                        key={phaseId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Phase {phaseId}
                        <button
                          onClick={() => handleRemovePhase(phaseId)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddRule}
              disabled={!selectedTask || allowedPhases.length === 0}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Add Phase Window Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Rules Section */}
      {rules.phaseWindow.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Active Phase Window Rules ({rules.phaseWindow.length})
          </Label>
          <div className="space-y-2">
            {rules.phaseWindow.map((rule, index) => (
              <Card key={index} className="bg-purple-50/50 border-purple-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-800"
                        >
                          {rule.task}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rule.allowedPhases.map((phase) => (
                          <Badge
                            key={phase}
                            variant="outline"
                            className="text-xs"
                          >
                            Phase {phase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRule(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Task can only run in {rule.allowedPhases.length} selected
                    phase(s)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {rules.phaseWindow.length === 0 && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="pt-6 pb-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No phase window rules defined yet. Create your first rule above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
