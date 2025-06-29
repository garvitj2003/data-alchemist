"use client";

import { RulesJSON } from "@/types/rules";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PendingRulesDisplayProps {
  pendingRules: Partial<RulesJSON>;
}

export default function PendingRulesDisplay({
  pendingRules,
}: PendingRulesDisplayProps) {
  const hasRules = Object.keys(pendingRules).some((key) => {
    const value = pendingRules[key as keyof RulesJSON];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });

  if (!hasRules) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-yellow-800">Pending Rules:</h4>

      {pendingRules.coRun?.map((rule, index) => (
        <Card key={`corun-${index}`} className="p-2 bg-yellow-50/50">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Co-Run
              </Badge>
              <span className="text-sm">Tasks: {rule.tasks.join(", ")}</span>
            </div>
          </CardContent>
        </Card>
      ))}

      {pendingRules.slotRestriction?.map((rule, index) => (
        <Card key={`slot-${index}`} className="p-2 bg-yellow-50/50">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Slot Restriction
              </Badge>
              <span className="text-sm">
                Group: {rule.group.join(", ")} | Min Slots:{" "}
                {rule.minCommonSlots}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {pendingRules.loadLimit?.map((rule, index) => (
        <Card key={`load-${index}`} className="p-2 bg-yellow-50/50">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Load Limit
              </Badge>
              <span className="text-sm">
                Group: {rule.group.join(", ")} | Max Per Phase:{" "}
                {rule.maxSlotsPerPhase}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {pendingRules.phaseWindow?.map((rule, index) => (
        <Card key={`phase-${index}`} className="p-2 bg-yellow-50/50">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Phase Window
              </Badge>
              <span className="text-sm">
                Task: {rule.task} | Phases: {rule.allowedPhases.join(", ")}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {pendingRules.precedence?.map((rule, index) => (
        <Card key={`precedence-${index}`} className="p-2 bg-yellow-50/50">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Precedence
              </Badge>
              <span className="text-sm">
                {rule.ruleA} has {rule.priority} priority over {rule.ruleB}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {pendingRules.prioritization && (
        <Card className="p-2 bg-yellow-50/50">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Prioritization
              </Badge>
              <span className="text-sm">
                Priority: {pendingRules.prioritization.PriorityLevel},
                Requested: {pendingRules.prioritization.RequestedTaskIDs},
                Fairness: {pendingRules.prioritization.Fairness}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
