"use client";

import EntityTable from "@/components/tables/entityTable";
import RuleBuilder from "@/components/rules/ruleBuilder";
import PrioritizationWeightsForm from "@/components/priorityAndWeights/PrioritizationWeightsForm";
import { Button } from "@/components/ui/button";
import { useAIValidationFix } from "@/hooks/useAiValidationFix";
import DataRetrievalChat from "@/components/custom/DataRetrievalChat";

export default function ValidatePage() {
  const { hasErrors, runFix, fixes, fixCell, loading } = useAIValidationFix();

  return (
    <div className="p-6 space-y-6 h-screen w-screen">
      <h1 className="text-2xl font-bold">Validate & Clean Data</h1>

      {/* Global Fix button */}
      {hasErrors && (
        <Button onClick={runFix} disabled={loading}>
          {loading ? "Fixing with AI..." : "Fix All with AI"}
        </Button>
      )}

      {/* Pass fixes and fixCell down as props */}
      <EntityTable
        entity="clients"
        fixes={fixes["clients"]}
        fixCell={fixCell}
      />
      <EntityTable
        entity="workers"
        fixes={fixes["workers"]}
        fixCell={fixCell}
      />
      <EntityTable entity="tasks" fixes={fixes["tasks"]} fixCell={fixCell} />

      <RuleBuilder />
      <PrioritizationWeightsForm />
      <DataRetrievalChat /> 
    </div>
  );
}
