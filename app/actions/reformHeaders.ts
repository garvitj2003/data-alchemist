// app/actions/suggestHeaders.ts
"use server";

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!, // make sure this is set in .env
});

type ReformHeadersInput = {
  rawHeaders: string[];
  sampleRow?: Record<string, string>; // Optional, improves accuracy
  expectedHeaders: string[];
};

export async function reformHeaders({
  rawHeaders,
  sampleRow,
  expectedHeaders,
}: ReformHeadersInput): Promise<Record<string, string>> {

  const prompt = `
You are a helpful AI assistant. A user has uploaded a CSV with headers that are possibly incorrect or not standardized. 
Your job is to map the headers provided by the user to the closest correct header names based on the expected schema.

Expected headers: ${expectedHeaders.join(", ")}
Uploaded headers: ${rawHeaders.join(", ")}

${
  sampleRow
    ? `Here is a sample row of data to help:
${JSON.stringify(sampleRow, null, 2)}`
    : ""
}

Return the corrected mapping in this format (JSON):
{
  "rawHeader1": "ExpectedHeaderX",
  "rawHeader2": "ExpectedHeaderY",
  ...
}
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    let responseText = result.text;
    if (!responseText) {
      return {}; // return empty mapping if no response
    }
    responseText = responseText.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/```(?:json)?/g, "").trim();
    }
    // Extract text and parse JSON
    const parsed = JSON.parse(responseText);

    // Return only valid mappings
    const validMappings = Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, value]) => typeof key === "string" && typeof value === "string"
      )
    ) as Record<string, string>;
    console.log(validMappings);
    return validMappings;
  } catch (err) {
    console.error("Gemini response error:", err);
    return {}; // return empty mapping on error
  }
}
