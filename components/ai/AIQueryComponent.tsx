"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIModifyTable } from "@/hooks/useAiDataModification";
import { EntityType } from "@/store/uploadAtoms";

interface AIQueryComponentProps {
  entity: EntityType;
}

export default function AIQueryComponent({ entity }: AIQueryComponentProps) {
  const [query, setQuery] = useState("");
  const {
    runAIModification,
    applyChanges,
    rejectChanges,
    loading,
    aiMessage,
    hasChanges,
    pendingChanges,
  } = useAIModifyTable(entity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await runAIModification(query.trim());
    setQuery(""); // Clear input after submission
  };

  const handleAcceptChanges = () => {
    applyChanges();
  };

  const handleRejectChanges = () => {
    rejectChanges();
  };

  // Count total pending changes
  const totalPendingChanges = pendingChanges
    ? Object.values(pendingChanges).reduce(
        (total, rowChanges) => total + Object.keys(rowChanges).length,
        0
      )
    : 0;

  return (
    <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        AI Query for {entity.charAt(0).toUpperCase() + entity.slice(1)}
      </h3>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter your modification query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Processing..." : "Send Query"}
        </Button>
      </form>

      {/* AI Message Display */}
      {aiMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm font-medium">AI Response:</p>
          <p className="text-blue-700 text-sm mt-1">{aiMessage}</p>
        </div>
      )}

      {/* Pending Changes Actions */}
      {hasChanges && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">
                {totalPendingChanges} change
                {totalPendingChanges !== 1 ? "s" : ""} pending
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                Review the highlighted changes below and accept or reject them.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRejectChanges}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Reject Changes
              </Button>
              <Button
                onClick={handleAcceptChanges}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Accept Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
