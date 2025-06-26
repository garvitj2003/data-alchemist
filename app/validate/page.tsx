import { EntityTable } from "@/components/tables/entityTable";

export default function ValidatePage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Validate & Clean Data</h1>
      <EntityTable entity="clients" />
      <EntityTable entity="workers" />
      <EntityTable entity="tasks" />
    </main>
  );
}
