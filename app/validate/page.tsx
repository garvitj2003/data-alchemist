"use client";

import EntityTable from "@/components/tables/entityTable";
import RuleBuilder from "@/components/rules/ruleBuilder";
import PrioritizationWeightsForm from "@/components/priorityAndWeights/PrioritizationWeightsForm";
import { Button } from "@/components/ui/button";
import { useAIValidationFix } from "@/hooks/useAiValidationFix";
import DataRetrievalChat from "@/components/custom/DataRetrievalChat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ThemeToggle from "@/components/themeToggle";
import ExportButton from "@/components/export/ExportButton";
import { useState } from "react";
import {
  Bot,
  Sparkles,
  Users,
  Briefcase,
  CheckSquare,
  Settings,
  MessageSquare,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
} from "lucide-react";

export default function ValidatePage() {
  const { hasErrors, runFix, fixes, fixCell, loading } = useAIValidationFix();
  const [currentTab, setCurrentTab] = useState<string>("clients");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Main Grid Layout */}
      <div className="h-screen grid grid-cols-[1fr_320px] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-col min-w-0 overflow-hidden">
          <div className="px-6 py-6 flex-1 overflow-auto">
            {/* Title and Controls */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10">
                    <CheckSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold">Data Validation</h1>
                </div>

                {/* Controls moved from navbar */}
                <div className="flex items-center space-x-4">
                  {/* Export buttons */}
                  <ExportButton />

                  {/* Global Fix button */}
                  {hasErrors && (
                    <Button
                      onClick={runFix}
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {loading ? "Fixing with AI..." : "Fix All with AI"}
                    </Button>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Tabs and Controls Row */}
            <div className="flex items-center justify-between mb-6">
              <Tabs
                defaultValue="clients"
                className="flex-1 min-w-0"
                onValueChange={setCurrentTab}
              >
                <div className="flex items-center justify-between">
                  <TabsList className="bg-muted/50 backdrop-blur-sm border shadow-sm h-auto">
                    <TabsTrigger
                      value="clients"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-background/70 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      Clients
                    </TabsTrigger>
                    <TabsTrigger
                      value="workers"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-background/70 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      Workers
                    </TabsTrigger>
                    <TabsTrigger
                      value="tasks"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-background/70 cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger
                      value="rules"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-background/70 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      Rules
                    </TabsTrigger>
                    <TabsTrigger
                      value="priorites"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-background/70 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      Priorites & weight
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Contents */}
                <div className="mt-6 flex-1 overflow-auto min-w-0">
                  <TabsContent value="clients" className="mt-0">
                    <EntityTable
                      entity="clients"
                      fixes={fixes["clients"]}
                      fixCell={fixCell}
                    />
                  </TabsContent>

                  <TabsContent value="workers" className="mt-0">
                    <EntityTable
                      entity="workers"
                      fixes={fixes["workers"]}
                      fixCell={fixCell}
                    />
                  </TabsContent>

                  <TabsContent value="tasks" className="mt-0">
                    <EntityTable
                      entity="tasks"
                      fixes={fixes["tasks"]}
                      fixCell={fixCell}
                    />
                  </TabsContent>

                  <TabsContent value="rules" className="mt-0">
                    <RuleBuilder />
                  </TabsContent>

                  <TabsContent value="priorites" className="mt-0">
                    <PrioritizationWeightsForm />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="border-l bg-card/30 backdrop-blur-sm flex flex-col min-w-0 overflow-hidden">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Assistant
              </h3>
            </div>
          </div>
          <div className="flex-1 overflow-auto min-w-0">
            <DataRetrievalChat currentTab={currentTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
