"use client";
import { rulesAtom } from "@/store/rulesAtoms";
import CoRunRule from "./coRunRule";
import { useAtomValue } from "jotai";
import { useState } from "react";
import SlotRestrictionRuleForm from "./slotRestrictionRule";
import LoadLimitRuleForm from "./loadLimitRule";
import PhaseWindowRuleForm from "./phaseWindowRule";
import PrecedenceOverrideRuleForm from "./precedenceOverrideRule";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Zap,
  Clock,
  TreePine,
  Target,
} from "lucide-react";

type RuleType =
  | "coRun"
  | "slotRestriction"
  | "loadLimit"
  | "phaseWindow"
  | "precedence";

const ruleTypes = [
  {
    id: "coRun" as RuleType,
    label: "Co-Run Rules",
    description: "Define tasks that must run together",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    id: "slotRestriction" as RuleType,
    label: "Slot Restriction",
    description: "Limit tasks to specific worker/client groups",
    icon: Target,
    color: "bg-green-500",
  },
  {
    id: "loadLimit" as RuleType,
    label: "Load Limit",
    description: "Control maximum tasks per worker per phase",
    icon: Zap,
    color: "bg-yellow-500",
  },
  {
    id: "phaseWindow" as RuleType,
    label: "Phase Window",
    description: "Restrict tasks to specific phases",
    icon: Clock,
    color: "bg-purple-500",
  },
  {
    id: "precedence" as RuleType,
    label: "Precedence Override",
    description: "Set priority between conflicting rules",
    icon: TreePine,
    color: "bg-red-500",
  },
];

export default function RuleBuilder() {
  const [selectedType, setSelectedType] = useState<RuleType>("coRun");
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const rules = useAtomValue(rulesAtom);

  const getRuleCount = (type: RuleType) => {
    const ruleArray = rules[type];
    return Array.isArray(ruleArray) ? ruleArray.length : 0;
  };

  const getTotalRuleCount = () => {
    return (
      rules.coRun.length +
      rules.slotRestriction.length +
      rules.loadLimit.length +
      rules.phaseWindow.length +
      rules.precedence.length
    );
  };

  const renderRuleComponent = (type: RuleType) => {
    switch (type) {
      case "coRun":
        return <CoRunRule />;
      case "slotRestriction":
        return <SlotRestrictionRuleForm />;
      case "loadLimit":
        return <LoadLimitRuleForm />;
      case "phaseWindow":
        return <PhaseWindowRuleForm />;
      case "precedence":
        return <PrecedenceOverrideRuleForm />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Rule Builder
          </CardTitle>
          <CardDescription>
            Create and manage scheduling rules for your tasks.
            <Badge variant="secondary" className="ml-2">
              {getTotalRuleCount()} rules defined
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as RuleType)}
          >
            <TabsList className="grid w-full grid-cols-5 h-auto">
              {ruleTypes.map((ruleType) => {
                const Icon = ruleType.icon;
                const count = getRuleCount(ruleType.id);
                return (
                  <TabsTrigger
                    key={ruleType.id}
                    value={ruleType.id}
                    className="flex flex-col items-center  gap-1 p-3 h-auto"
                  >
                    <div className="flex justify-between items-center  gap-1 w-full">
                      <div className="flex items-center gap-1">
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs">
                          {ruleType.label.split(" ")[0]}
                        </span>
                      </div>

                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs rounded-full px-2 py-0.5"
                        >
                          {count}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {ruleTypes.map((ruleType) => (
              <TabsContent
                key={ruleType.id}
                value={ruleType.id}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-md ${ruleType.color}`}>
                        <ruleType.icon className="h-4 w-4 text-white" />
                      </div>
                      {ruleType.label}
                      <Badge variant="outline" className="ml-auto">
                        {getRuleCount(ruleType.id)} rules
                      </Badge>
                    </CardTitle>
                    <CardDescription>{ruleType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>{renderRuleComponent(ruleType.id)}</CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsDebugOpen(!isDebugOpen)}
        >
          {isDebugOpen ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Hide Rule Debug View
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show Rule Debug View
            </>
          )}
        </Button>

        {isDebugOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Rule Configuration (JSON)
              </CardTitle>
              <CardDescription>
                Current rule configuration for debugging purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(rules, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
