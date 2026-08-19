import { z } from "zod";

// ==========================================
// USER INPUT
// ==========================================

export const complaintSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Complaint text is required")
    .max(5000, "Complaint is too long"),
});


// ==========================================
// AI OUTPUT
// ==========================================

export const complaintAnalysisSchema = z.object({
  category: z.enum([
    "delivery",
    "billing",
    "product",
    "support",
    "other",
  ]),

  sentiment: z.enum([
    "positive",
    "neutral",
    "negative",
  ]),

  severity: z.enum([
    "low",
    "medium",
    "high",
  ]),

  summary: z.string(),

  suggestedAction: z.string(),
});