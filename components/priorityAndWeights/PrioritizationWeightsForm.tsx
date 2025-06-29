"use client";

import { useAtom } from "jotai";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prioritizationWeightsAtom } from "@/store/prioritizationAtom";
import { rulesAtom } from "@/store/rulesAtoms";
import { CheckCircle, AlertCircle } from "lucide-react";

const fields = [
  {
    key: "PriorityLevel",
    label: "Priority Level",
    description: "Importance of task priority",
  },
  {
    key: "RequestedTaskIDs",
    label: "Requested Task IDs",
    description: "Specific task requirements",
  },
  {
    key: "PrefferedPhases",
    label: "Preferred Phases",
    description: "Project phase preferences",
  },
  { key: "Fairness", label: "Fairness", description: "Equitable distribution" },
] as const;

export default function PrioritizationWeightsForm() {
  const [weights, setWeights] = useAtom(prioritizationWeightsAtom);
  const [, setRules] = useAtom(rulesAtom);

  const total = fields.reduce((sum, field) => sum + weights[field.key], 0);
  const isBalanced = Math.abs(total - 1) < 0.01; // Allow small floating point errors

  const handleSliderChange = (fieldKey: string, newValue: number) => {
    const otherFields = fields.filter((f) => f.key !== fieldKey);
    const otherFieldsTotal = otherFields.reduce(
      (sum, field) => sum + weights[field.key],
      0
    );

    // Calculate remaining weight for other fields
    const remainingWeight = 1 - newValue;

    if (remainingWeight <= 0) {
      // If new value is 1 or more, set others to 0
      const newWeights = { ...weights, [fieldKey]: 1 };
      otherFields.forEach((field) => {
        newWeights[field.key] = 0;
      });
      setWeights(newWeights);
    } else if (otherFieldsTotal > 0) {
      // Proportionally distribute remaining weight among other fields
      const newWeights = { ...weights, [fieldKey]: newValue };
      const scaleFactor = remainingWeight / otherFieldsTotal;

      otherFields.forEach((field) => {
        newWeights[field.key] = weights[field.key] * scaleFactor;
      });

      setWeights(newWeights);
    } else {
      // If other fields are all 0, distribute equally
      const equalWeight = remainingWeight / otherFields.length;
      const newWeights = { ...weights, [fieldKey]: newValue };

      otherFields.forEach((field) => {
        newWeights[field.key] = equalWeight;
      });

      setWeights(newWeights);
    }
  };

  const handleAddToRules = () => {
    setRules((prev) => ({
      ...prev,
      prioritization: { ...weights },
    }));
  };

  const resetWeights = () => {
    const equalWeight = 1 / fields.length;
    const resetWeights = Object.fromEntries(
      fields.map((field) => [field.key, equalWeight])
    );
    setWeights(resetWeights as typeof weights);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Prioritization Weights</CardTitle>
          <Badge
            variant={isBalanced ? "default" : "destructive"}
            className="ml-2"
          >
            {isBalanced ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Balanced
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Unbalanced
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Adjust the importance weights for each prioritization factor. The
          sliders will automatically balance to maintain a total of 1.0.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {fields.map((field) => (
          <div key={field.key} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">
                  {field.label}
                </label>
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              </div>
              <Badge variant="outline" className="ml-2 font-mono">
                {(weights[field.key] * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="space-y-2">
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[weights[field.key]]}
                onValueChange={([val]) => handleSliderChange(field.key, val)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">
                  Weight: {weights[field.key].toFixed(3)}
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            {isBalanced ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              Total Weight:
              <span
                className={
                  isBalanced ? "text-green-600 ml-1" : "text-red-500 ml-1"
                }
              >
                {total.toFixed(3)}
              </span>
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetWeights}
            className="text-xs"
          >
            Reset Equal
          </Button>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleAddToRules}
            disabled={!isBalanced}
            className="flex-1"
          >
            Add to Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
