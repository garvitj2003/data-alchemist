"use client";

import { useAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
import { uploadedFilesAtom } from "@/store/uploadAtoms";
import { useState } from "react";
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
import { AlertCircle, Check, Users, X } from "lucide-react";

export default function CoRunRule() {
  const [rules, setRules] = useAtom(rulesAtom);
  const [files] = useAtom(uploadedFilesAtom);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<string>("");

  const taskFile = files.find((f) => f.entityType === "tasks");
  const taskOptions =
    taskFile?.rawData.map((task) => ({
      label: task.TaskID,
      value: task.TaskID,
    })) || [];

  const availableTaskOptions = taskOptions.filter(
    (task) => !selectedTasks.includes(task.value)
  );

  const handleAddTask = (taskId: string) => {
    if (taskId && !selectedTasks.includes(taskId)) {
      setSelectedTasks([...selectedTasks, taskId]);
      setCurrentTask("");
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
  };

  const handleAddRule = () => {
    if (selectedTasks.length < 2) return;

    setRules((prev) => ({
      ...prev,
      coRun: [...prev.coRun, { tasks: selectedTasks }],
    }));

    setSelectedTasks([]); // Reset
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      coRun: prev.coRun.filter((_, i) => i !== index),
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
                <Users className="h-4 w-4" />
                Select Tasks to Run Together
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose 2 or more tasks that must be scheduled to run
                simultaneously
              </p>

              <Select value={currentTask} onValueChange={handleAddTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTaskOptions.map((task) => (
                    <SelectItem key={task.value} value={task.value}>
                      {task.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Tasks Display */}
              {selectedTasks.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Selected Tasks:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTasks.map((taskId) => (
                      <Badge
                        key={taskId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {taskId}
                        <button
                          onClick={() => handleRemoveTask(taskId)}
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

            {selectedTasks.length > 0 && selectedTasks.length < 2 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Select at least 2 tasks to create a co-run rule
              </div>
            )}

            <Button
              onClick={handleAddRule}
              disabled={selectedTasks.length < 2}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Add Co-run Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Rules Section */}
      {rules.coRun.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Active Co-run Rules ({rules.coRun.length})
          </Label>
          <div className="space-y-2">
            {rules.coRun.map((rule, index) => (
              <Card key={index} className="bg-blue-50/50 border-blue-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {rule.tasks.map((task) => (
                        <Badge
                          key={task}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          {task}
                        </Badge>
                      ))}
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
                    These {rule.tasks.length} tasks will be scheduled to run
                    together
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {rules.coRun.length === 0 && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="pt-6 pb-6 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No co-run rules defined yet. Create your first rule above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
