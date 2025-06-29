"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type ModifyTableInput = {
  entity: "clients" | "tasks" | "workers";
  prompt: string;
  data: Record<string, any>[];
};

type ModifyTableResponse = {
  message: string;
  changes: Record<number, Record<string, any>>;
};

export async function modifyTable({
  entity,
  prompt,
  data,
}: ModifyTableInput): Promise<ModifyTableResponse> {
  const tableContext = JSON.stringify(data, null, 2);

  const fullPrompt = `
You are a strict spreadsheet assistant.

You are working on data for the "${entity}" entity. Your job is to apply the user’s modification request carefully **without altering the data format**.

- DO NOT Change numbers to strings (e.g., "123")
- DO NOT Alter JSON objects/arrays structure
- DO NOT Add extra fields or remove any unrelated data
- DO NOT Wrap response in markdown like \`\`\`json
- DO NOT change the field name

Your response must include:
1. A short user-friendly message summarizing what changed
2. A changes object showing **only the modified fields** with **row index keys**
3. data with the specific field name only (e.g. "AttributesJSON", "PriorityLevel", etc.)
4. If a specific key of AttributesJSON needs to be changed then you must return the  non changed keys as well for example

---

User request:
"${prompt}"

Data:
${tableContext}

---

Respond strictly in this format (no markdown):
{
  "message": "Increased budget in 3 rows.",
  "changes": {
    "2": { "AttributesJSON": { "budget": "12000" } },
    "4": { "PriorityLevel": 3 }
  }
}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: { temperature: 0.2 },
    });

    const responseText = response.text?.trim();
    if (!responseText) return { message: "No changes returned.", changes: {} };

    const cleaned = responseText.replace(/```json|```/g, "");
    const parsed = JSON.parse(cleaned);

    if (!parsed.message || !parsed.changes) {
      throw new Error("Unexpected AI response format.");
    }
    console.log("changes", parsed.changes);
    console.log("msg", parsed.message);
    return {
      message: parsed.message,
      changes: parsed.changes,
    };
  } catch (err) {
    console.error("AI modify error:", err);
    return {
      message: "AI failed to generate changes.",
      changes: {},
    };
  }
}
