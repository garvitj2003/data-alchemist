"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

let chatSession: any = null;

type AskWithContextInput = {
  allData: {
    clients: any[];
    workers: any[];
    tasks: any[];
  };
  userQuery: string;
};

export async function dataRetrieval({
  allData,
  userQuery,
}: AskWithContextInput): Promise<string> {
  try {
    // Start chat session only once (in-memory)
    if (!chatSession) {
      const systemContext = `
You are a data assistant. You have access to 3 tables: clients, workers, and tasks.
Below is the data you will use to answer all questions.

--- BEGIN CONTEXT ---

Clients:
${JSON.stringify(allData.clients, null, 2)}

Workers:
${JSON.stringify(allData.workers, null, 2)}

Tasks:
${JSON.stringify(allData.tasks, null, 2)}

--- END CONTEXT ---

Your job is to help the user understand, summarize, and extract insights from this data.
Respond clearly and use bullet points or tables if helpful.
If a field contains an object or list, explain what it means.
`;

      chatSession = ai.chats.create({
        model: "gemini-2.0-flash-001",
        config: {
          systemInstruction: systemContext,
        },
      });
    }

    // Now ask the user's question
    const result = await chatSession.sendMessage({
      message: userQuery,
    });
    return result.text || "No response from Gemini.";
  } catch (err) {
    console.error("Gemini context chat error:", err);
    return "Something went wrong while processing your question.";
  }
}
