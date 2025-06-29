"use client";

import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { rulesAtom } from "@/store/rulesAtoms";
import { uploadedFilesAtom } from "@/store/uploadAtoms";
import { createRulesWithAI } from "@/app/actions/rulesCreation";
import { RulesJSON } from "@/types/rules";

export function useAIRulesCreation() {
  const [rules, setRules] = useAtom(rulesAtom);
  const uploadedFiles = useAtomValue(uploadedFilesAtom);
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [pendingRules, setPendingRules] = useState<Partial<RulesJSON> | null>(
    null
  );

  const runAIModification = async (userPrompt: string) => {
    setLoading(true);
    setAiMessage(null);
    setPendingRules(null);

    // Extract available data for context
    const availableData = {
      tasks:
        uploadedFiles
          .find((f) => f.entityType === "tasks")
          ?.rawData?.map((row) => row.TaskID) || [],
      workers:
        uploadedFiles
          .find((f) => f.entityType === "workers")
          ?.rawData?.map((row) => row.WorkerID) || [],
      clients:
        uploadedFiles
          .find((f) => f.entityType === "clients")
          ?.rawData?.map((row) => row.ClientID) || [],
    };

    const result = await createRulesWithAI({
      prompt: userPrompt,
      currentRules: rules,
      availableData,
    });

    setAiMessage(result.message);
    setPendingRules(result.newRules);
    setLoading(false);
  };

  const applyChanges = () => {
    if (!pendingRules) return;

    setRules((prevRules) => {
      const updatedRules: RulesJSON = { ...prevRules };

      // Add new rules to existing ones
      if (pendingRules.coRun?.length) {
        updatedRules.coRun = [...updatedRules.coRun, ...pendingRules.coRun];
      }
      if (pendingRules.slotRestriction?.length) {
        updatedRules.slotRestriction = [
          ...updatedRules.slotRestriction,
          ...pendingRules.slotRestriction,
        ];
      }
      if (pendingRules.loadLimit?.length) {
        updatedRules.loadLimit = [
          ...updatedRules.loadLimit,
          ...pendingRules.loadLimit,
        ];
      }
      if (pendingRules.phaseWindow?.length) {
        updatedRules.phaseWindow = [
          ...updatedRules.phaseWindow,
          ...pendingRules.phaseWindow,
        ];
      }
      if (pendingRules.precedence?.length) {
        updatedRules.precedence = [
          ...updatedRules.precedence,
          ...pendingRules.precedence,
        ];
      }
      if (pendingRules.prioritization) {
        updatedRules.prioritization = pendingRules.prioritization;
      }

      return updatedRules;
    });

    // Clear pending after applying
    setPendingRules(null);
    setAiMessage(aiMessage + " ✅ Rules added successfully!");
  };

  const rejectChanges = () => {
    setPendingRules(null);
    setAiMessage(null);
  };

  // For compatibility with the existing interface
  const applyIndividualChange = () => {
    // Not applicable for rules - they are added as complete rule objects
    console.warn("Individual changes not supported for rules");
  };

  return {
    runAIModification,
    applyChanges,
    rejectChanges,
    applyIndividualChange,
    loading,
    aiMessage,
    hasChanges:
      !!pendingRules &&
      Object.keys(pendingRules).some((key) => {
        const value = pendingRules[key as keyof RulesJSON];
        return Array.isArray(value) ? value.length > 0 : !!value;
      }),
    pendingChanges: pendingRules, // For compatibility
  };
}
