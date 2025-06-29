"use client";

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
import { useAtomValue, useAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
import { TreePine, Check, AlertCircle, ArrowRight } from "lucide-react";

// Helper function to extract rule identifiers from rulesAtom
function useRuleIdentifiers() {
  const rules = useAtomValue(rulesAtom);
  const ids: string[] = [];

  rules.coRun.forEach((r, i) =>
    ids.push(`Co-Run #${i + 1}: ${r.tasks.join(", ")}`)
  );
  rules.slotRestriction.forEach((r, i) =>
    ids.push(`Slot Restriction #${i + 1}: ${r.group.join(", ")}`)
  );
  rules.loadLimit.forEach((r, i) =>
    ids.push(`Load Limit #${i + 1}: ${r.group.join(", ")}`)
  );
  rules.phaseWindow.forEach((r, i) =>
    ids.push(`Phase Window #${i + 1}: ${r.task}`)
  );

  return ids;
}

export default function PrecedenceOverrideRuleForm() {
  const ruleOptions = useRuleIdentifiers();
  const [rules, setRules] = useAtom(rulesAtom);

  const [ruleA, setRuleA] = useState("");
  const [ruleB, setRuleB] = useState("");
  const [priority, setPriority] = useState<"high" | "low">("high");

  const handleAddRule = () => {
    if (!ruleA || !ruleB || ruleA === ruleB) return;

    setRules((prev) => ({
      ...prev,
      precedence: [...prev.precedence, { ruleA, ruleB, priority }],
    }));

    // Reset
    setRuleA("");
    setRuleB("");
    setPriority("high");
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      precedence: prev.precedence.filter((_, i) => i !== index),
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
                <TreePine className="h-4 w-4" />
                Rule Precedence Setup
              </Label>
              <p className="text-sm text-muted-foreground">
                Define priority between conflicting rules. Choose which rules
                should take precedence when they conflict.
              </p>
            </div>

            {ruleOptions.length < 2 ? (
              <div className="flex items-center gap-2 text-amber-600 text-sm p-4 bg-amber-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                You need at least 2 other rules before you can create precedence
                rules.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">First Rule</Label>
                    <Select value={ruleA} onValueChange={setRuleA}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select first rule" />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleOptions.map((id) => (
                          <SelectItem
                            key={id}
                            value={id}
                            disabled={id === ruleB}
                          >
                            {id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Second Rule</Label>
                    <Select value={ruleB} onValueChange={setRuleB}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select second rule" />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleOptions.map((id) => (
                          <SelectItem
                            key={id}
                            value={id}
                            disabled={id === ruleA}
                          >
                            {id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(val) => setPriority(val as "high" | "low")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        First Rule takes priority
                      </SelectItem>
                      <SelectItem value="low">
                        Second Rule takes priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose which rule should be prioritized when both rules
                    conflict
                  </p>
                </div>

                <Button
                  onClick={handleAddRule}
                  disabled={!ruleA || !ruleB || ruleA === ruleB}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add Precedence Rule
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Rules Section */}
      {rules.precedence.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Active Precedence Rules ({rules.precedence.length})
          </Label>
          <div className="space-y-2">
            {rules.precedence.map((rule, index) => (
              <Card key={index} className="bg-red-50/50 border-red-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge
                          variant={
                            rule.priority === "high" ? "default" : "secondary"
                          }
                          className={
                            rule.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }
                        >
                          {rule.ruleA.split(":")[0]}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge
                          variant={
                            rule.priority === "low" ? "default" : "secondary"
                          }
                          className={
                            rule.priority === "low"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }
                        >
                          {rule.ruleB.split(":")[0]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rule.priority === "high"
                          ? "First rule"
                          : "Second rule"}{" "}
                        takes priority in conflicts
                      </p>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {rules.precedence.length === 0 && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="pt-6 pb-6 text-center">
            <TreePine className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No precedence rules defined yet. Create your first rule above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
