"use server";

import { GoogleGenAI } from "@google/genai";
import { RulesJSON } from "@/types/rules";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type CreateRulesInput = {
  prompt: string;
  currentRules: RulesJSON;
  availableData?: {
    tasks?: string[];
    workers?: string[];
    clients?: string[];
  };
};

type CreateRulesResponse = {
  message: string;
  newRules: Partial<RulesJSON>;
};

export async function createRulesWithAI({
  prompt,
  currentRules,
  availableData,
}: CreateRulesInput): Promise<CreateRulesResponse> {
  const rulesContext = JSON.stringify(currentRules, null, 2);
  const dataContext = availableData
    ? JSON.stringify(availableData, null, 2)
    : "No data available";

  const fullPrompt = `
You are a rule creation assistant for a scheduling system.

Current Rules:
${rulesContext}

Available Data Context:
${dataContext}

Rule Types Available:
1. coRun: Tasks that must run together
   Format: { tasks: string[] }

2. slotRestriction: Groups that need minimum common slots
   Format: { group: string[]; minCommonSlots: number }

3. loadLimit: Groups with maximum slots per phase
   Format: { group: string[]; maxSlotsPerPhase: number }

4. phaseWindow: Tasks restricted to specific phases
   Format: { task: string; allowedPhases: number[] }

5. precedence: Rule priority relationships
   Format: { ruleA: string; ruleB: string; priority: "high" | "low" }

6. prioritization: Weighting for different factors
   Format: { PriorityLevel: number; RequestedTaskIDs: number; Fairness: number }

User Request:
"${prompt}"

Create new rules based on the user's request. You should:
- Only return NEW rules to be ADDED to the existing rules
- Use exact field names and formats shown above
- Reference actual task/worker/client IDs when available
- For phases, use numbers 1-6
- For precedence, reference other rule descriptions
- Ensure numbers are actual numbers, not strings

Respond strictly in this JSON format (no markdown):
{
  "message": "Created 2 co-run rules for the specified tasks",
  "newRules": {
    "coRun": [
      { "tasks": ["TASK1", "TASK2"] }
    ],
    "slotRestriction": [],
    "loadLimit": [],
    "phaseWindow": [],
    "precedence": []
  }
}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
      config: { temperature: 0.3 },
    });

    const responseText = response.text?.trim();
    if (!responseText) return { message: "No rules generated.", newRules: {} };

    const cleaned = responseText.replace(/```json|```/g, "");
    const parsed = JSON.parse(cleaned);

    if (!parsed.message || !parsed.newRules) {
      throw new Error("Unexpected AI response format.");
    }

    return {
      message: parsed.message,
      newRules: parsed.newRules,
    };
  } catch (err) {
    console.error("AI rules creation error:", err);
    return {
      message:
        "AI failed to generate rules. Please try rephrasing your request.",
      newRules: {},
    };
  }
}
