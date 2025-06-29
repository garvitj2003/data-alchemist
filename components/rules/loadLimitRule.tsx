"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
import { useAtomValue } from "jotai";
import { uploadedFilesAtom } from "@/store/uploadAtoms";
import { Zap, Check, AlertCircle, X } from "lucide-react";

export default function LoadLimitRuleForm() {
  const [rules, setRules] = useAtom(rulesAtom);
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
  const [currentWorker, setCurrentWorker] = useState<string>("");
  const [maxSlotsPerPhase, setMaxSlotsPerPhase] = useState(1);

  const availableWorkerOptions = workerOptions.filter(
    (worker) => !selectedWorkers.includes(worker.value)
  );

  const handleAddWorker = (workerId: string) => {
    if (workerId && !selectedWorkers.includes(workerId)) {
      setSelectedWorkers([...selectedWorkers, workerId]);
      setCurrentWorker("");
    }
  };

  const handleRemoveWorker = (workerId: string) => {
    setSelectedWorkers(selectedWorkers.filter((id) => id !== workerId));
  };

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

  const handleRemoveRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      loadLimit: prev.loadLimit.filter((_, i) => i !== index),
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
                <Zap className="h-4 w-4" />
                Select Workers
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose workers to apply load limits to
              </p>

              <Select value={currentWorker} onValueChange={handleAddWorker}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a worker to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkerOptions.map((worker) => (
                    <SelectItem key={worker.value} value={worker.value}>
                      {worker.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Workers Display */}
              {selectedWorkers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Selected Workers:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkers.map((workerId) => (
                      <Badge
                        key={workerId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {workerId}
                        <button
                          onClick={() => handleRemoveWorker(workerId)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {workerOptions.length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  No workers available. Please upload worker data first.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSlots" className="text-sm font-medium">
                Maximum Tasks Per Phase
              </Label>
              <Input
                id="maxSlots"
                type="number"
                min={1}
                value={maxSlotsPerPhase}
                onChange={(e) => setMaxSlotsPerPhase(Number(e.target.value))}
                placeholder="Maximum tasks per phase"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of tasks each worker can handle per phase
              </p>
            </div>

            <Button
              onClick={handleAddRule}
              disabled={selectedWorkers.length === 0 || maxSlotsPerPhase < 1}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Add Load Limit Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Rules Section */}
      {rules.loadLimit.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Active Load Limit Rules ({rules.loadLimit.length})
          </Label>
          <div className="space-y-2">
            {rules.loadLimit.map((rule, index) => (
              <Card key={index} className="bg-yellow-50/50 border-yellow-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Max {rule.maxSlotsPerPhase} tasks/phase
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rule.group.slice(0, 3).map((worker) => (
                          <Badge
                            key={worker}
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            {worker}
                          </Badge>
                        ))}
                        {rule.group.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            +{rule.group.length - 3} more
                          </Badge>
                        )}
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
                    {rule.group.length} worker(s) limited to{" "}
                    {rule.maxSlotsPerPhase} task(s) per phase
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {rules.loadLimit.length === 0 && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="pt-6 pb-6 text-center">
            <Zap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No load limit rules defined yet. Create your first rule above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
