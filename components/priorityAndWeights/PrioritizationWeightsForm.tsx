"use client";

import { useAtom } from "jotai";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { prioritizationWeightsAtom } from "@/store/prioritizationAtom";
import { rulesAtom } from "@/store/rulesAtoms";

const fields = ["PriorityLevel", "RequestedTaskIDs", "PrefferedPhases" , "Fairness" ] as const;

export default function PrioritizationWeightsForm() {
  const [weights, setWeights] = useAtom(prioritizationWeightsAtom);
  const [, setRules] = useAtom(rulesAtom);

  const total = fields.reduce((sum, field) => sum + weights[field], 0);

  const normalizeWeights = () => {
    const normalized = Object.fromEntries(
      fields.map((field) => [
        field,
        parseFloat((weights[field] / total).toFixed(2)),
      ])
    );
    setWeights(normalized as typeof weights);
  };

  const handleAddToRules = () => {
    normalizeWeights(); // always normalize before pushing
    setRules((prev) => ({
      ...prev,
      prioritization: { ...weights },
    }));
  };

  return (
    <div className="space-y-6 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Prioritization Weights</h3>
      <p className="text-sm text-muted-foreground">
        Adjust the importance (weights) for each factor. Total must equal 1.
      </p>

      {fields.map((field) => (
        <div key={field}>
          <label className="capitalize font-medium">{field}</label>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={[weights[field]]}
            onValueChange={([val]) =>
              setWeights((prev) => ({ ...prev, [field]: val }))
            }
          />
          <div className="text-xs text-muted-foreground">
            Weight: {weights[field].toFixed(2)}
          </div>
        </div>
      ))}

      <div className="text-right text-sm">
        Total:{" "}
        <span
          className={
            total.toFixed(2) === "1.00" ? "text-green-600" : "text-red-500"
          }
        >
          {total.toFixed(2)}
        </span>
      </div>

      <Button
        onClick={handleAddToRules}
        disabled={total.toFixed(2) !== "1.00"}
      >
        Add to Rules
      </Button>
    </div>
  );
}
