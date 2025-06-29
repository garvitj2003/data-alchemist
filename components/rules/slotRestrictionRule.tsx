"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAtom } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
import { Target, Check, Users, Building } from "lucide-react";

export default function SlotRestrictionRuleForm() {
  const [rules, setRules] = useAtom(rulesAtom);

  const [groupType, setGroupType] = useState<"ClientGroup" | "WorkerGroup">(
    "WorkerGroup"
  );
  const [groupId, setGroupId] = useState("");
  const [minCommonSlots, setMinCommonSlots] = useState(1);

  const handleAddRule = () => {
    if (!groupId.trim() || minCommonSlots < 1) return;

    const newRule = {
      group: [groupId.trim()],
      minCommonSlots,
    };

    setRules((prev) => ({
      ...prev,
      slotRestriction: [...prev.slotRestriction, newRule],
    }));

    // Reset state
    setGroupId("");
    setMinCommonSlots(1);
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      slotRestriction: prev.slotRestriction.filter((_, i) => i !== index),
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
                <Target className="h-4 w-4" />
                Group Type
              </Label>
              <Select
                value={groupType}
                onValueChange={(val) => setGroupType(val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WorkerGroup">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Worker Group
                    </div>
                  </SelectItem>
                  <SelectItem value="ClientGroup">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Client Group
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose whether to restrict based on worker or client groups
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId" className="text-sm font-medium">
                Group ID
              </Label>
              <Input
                id="groupId"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder={`Enter ${
                  groupType === "WorkerGroup" ? "worker" : "client"
                } group ID`}
              />
              <p className="text-xs text-muted-foreground">
                Specify the ID or name of the{" "}
                {groupType === "WorkerGroup" ? "worker" : "client"} group
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minSlots" className="text-sm font-medium">
                Minimum Common Slots
              </Label>
              <Input
                id="minSlots"
                type="number"
                min={1}
                value={minCommonSlots}
                onChange={(e) => setMinCommonSlots(Number(e.target.value))}
                placeholder="Minimum slots required"
              />
              <p className="text-xs text-muted-foreground">
                Minimum number of common slots required for this group
              </p>
            </div>

            <Button
              onClick={handleAddRule}
              disabled={!groupId.trim() || minCommonSlots < 1}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Add Slot Restriction Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Rules Section */}
      {rules.slotRestriction.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Active Slot Restriction Rules ({rules.slotRestriction.length})
          </Label>
          <div className="space-y-2">
            {rules.slotRestriction.map((rule, index) => (
              <Card key={index} className="bg-green-50/50 border-green-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {rule.group[0]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Min {rule.minCommonSlots} slots
                        </span>
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
                    Group requires at least {rule.minCommonSlots} common slot(s)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {rules.slotRestriction.length === 0 && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="pt-6 pb-6 text-center">
            <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No slot restriction rules defined yet. Create your first rule
              above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
