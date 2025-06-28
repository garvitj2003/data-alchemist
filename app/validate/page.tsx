import EntityTable from "@/components/tables/entityTable";
import RuleBuilder from "@/components/rules/ruleBuilder";
import PrioritizationWeightsForm from "@/components/priorityAndWeights/PrioritizationWeightsForm";

export default function ValidatePage() {
  return (
    <div className="p-6 space-y-6 h-screen w-screen">
      <h1 className="text-2xl font-bold">Validate & Clean Data</h1>
      <EntityTable entity="clients" />
      <EntityTable entity="workers" />
      <EntityTable entity="tasks" />
      <RuleBuilder />
      <PrioritizationWeightsForm />
    </div>
  );
}
