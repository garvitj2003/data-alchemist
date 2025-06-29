// app/actions/fixAllWithAI.ts
"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type FixAllInput = {
  uploadedFiles: {
    entityType: "clients" | "tasks" | "workers";
    rawData: Record<string, any>[];
  }[];
  validationErrors: Record<
    "clients" | "tasks" | "workers",
    Record<number, Record<string, string>>
  >;
};

type FixAllOutput = {
  [K in "clients" | "tasks" | "workers"]?: {
    [rowIndex: number]: Record<string, any>;
  };
};

export async function fixAllWithAI({
  uploadedFiles,
  validationErrors,
}: FixAllInput): Promise<FixAllOutput> {
  const context: Record<string, any> = {};
  const errorContext: FixAllOutput = {};

  for (const { entityType, rawData } of uploadedFiles) {
    const entityErrors = validationErrors[entityType] || {};
    const erroredRows: Record<number, any> = {};

    for (const rowIndex in entityErrors) {
      const idx = parseInt(rowIndex);
      erroredRows[idx] = {
        original: rawData[idx],
        errors: entityErrors[idx],
      };
    }

    if (Object.keys(erroredRows).length > 0) {
      context[entityType] = rawData; // for Gemini's awareness
      errorContext[entityType] = erroredRows;
    }
  }

  const prompt = `
You are a strict AI assistant fixing tabular validation errors.

Given:
- "Data": The uploaded CSV table per entity ("clients", "tasks", "workers").
- "Errors": The validation errors mapped to row index and field.
- All values must remain consistent with their expected data types and structures.
- The "AttributesJSON" field (mainly in clients) should contain valid, parsable JSON with commonly expected keys like:
  - location - with a value by understanding data pattern
  - budget - with a value by understanding data pattern
  DO NOT INCLUDE ANYTHING OTHER THAN BUDGET AND LOCATION IN THE ATTRIBUTESJSON
  If AttributesJSON is missing or malformed, fix it by generating a well-formed JSON object containing reasonable default keys and values.

Your job is to fix ONLY the erroneous fields while preserving structure.

--- BEGIN CONTEXT ---

Data:
${JSON.stringify(context, null, 2)}

Errors:
${JSON.stringify(errorContext, null, 2)}

--- END CONTEXT ---

Respond ONLY with corrected values in this format:

{
  "clients": {
    "0": {
      "PriorityLevel": 3,
      "AttributesJSON": {
        "location": "Lonod",
        "budget": 5000,
        
      }
    }
  },
  "tasks": {
    "1": { "RequiredSkills": ["Java", "SQL"] }
  }
}

No markdown, no explanation. Strict JSON only.
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const raw = result.text?.trim();

    // Handle ```json blocks if returned
    const jsonString =
      raw?.startsWith("```json") || raw?.startsWith("```")
        ? raw
            .replace(/```(json)?/, "")
            .replace(/```$/, "")
            .trim()
        : raw;

    console.log(jsonString);
    return JSON.parse(jsonString || "{}") as FixAllOutput;
  } catch (error) {
    console.error("Gemini AI correction error:", error);
    return {};
  }
}
