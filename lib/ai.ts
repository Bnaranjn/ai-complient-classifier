import { GoogleGenAI } from "@google/genai";
import { complaintAnalysisSchema } from "./validation";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeComplaint(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",

    contents: `
Analyze this customer complaint:

${text}

Classify the complaint and provide:

- category
- sentiment
- severity
- summaryca
- suggestedAction
`,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: "object",

        properties: {
          category: {
            type: "string",
            enum: [
              "delivery",
              "billing",
              "product",
              "support",
              "other",
            ],
          },

          sentiment: {
            type: "string",
            enum: [
              "positive",
              "neutral",
              "negative",
            ],
          },

          severity: {
            type: "string",
            enum: [
              "low",
              "medium",
              "high",
            ],
          },

          summary: {
            type: "string",
          },

          suggestedAction: {
            type: "string",
          },
        },

        required: [
          "category",
          "sentiment",
          "severity",
          "summary",
          "suggestedAction",
        ],
      },
    },
  });

  const rawResult = response.text;

  if (!rawResult) {
    throw new Error("AI returned an empty response");
  }

  const parsedResult = JSON.parse(rawResult);

  // Validate the AI's response before returning it
  return complaintAnalysisSchema.parse(parsedResult);
}