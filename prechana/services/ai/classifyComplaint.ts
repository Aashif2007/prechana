import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CATEGORIES = [
  "pothole", "streetlight", "garbage", "drainage", "water_leakage",
  "damaged_road", "fallen_tree", "public_infrastructure", "other",
] as const;

const DEPARTMENT_CATEGORIES = [
  "roads", "electrical_services", "sanitation", "drainage_water",
  "horticulture", "general",
] as const;

// Only these fields survive validation. Invented names, phones or URLs are dropped.
const ResultSchema = z.object({
  category: z.enum(CATEGORIES),
  subcategory: z.string().max(60),
  severity: z.enum(["low", "medium", "high"]),
  summary: z.string().max(200),
  suggested_department_category: z.enum(DEPARTMENT_CATEGORIES),
  confidence: z.number().min(0).max(1),
});

export type ClassificationResult = z.infer<typeof ResultSchema>;

export type ClassifyInput = {
  description: string;
  lat: number;
  lng: number;
  imageBase64?: string;
  imageMimeType?: string;
};

// Any AI vendor implements this. It returns raw data; validation happens below.
export interface AIProvider {
  classify(input: ClassifyInput): Promise<unknown>;
}

const PROMPT = `You classify civic complaints. Reply with JSON only, using exactly these keys:
category (one of ${CATEGORIES.join(", ")}),
subcategory (short snake_case string),
severity (low, medium or high),
summary (one sentence),
suggested_department_category (one of ${DEPARTMENT_CATEGORIES.join(", ")}),
confidence (number from 0 to 1).
Never include names, phone numbers, emails or URLs.`;

class GeminiProvider implements AIProvider {
  async classify(input: ClassifyInput): Promise<unknown> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      generationConfig: { responseMimeType: "application/json" },
    });

    // Exact coordinates are not needed for classification, so they are not sent.
    const parts: any[] = [PROMPT, "Citizen description: " + input.description];
    if (input.imageBase64 && input.imageMimeType) {
      parts.push({ inlineData: { data: input.imageBase64, mimeType: input.imageMimeType } });
    }

    const result = await model.generateContent(parts);
    return JSON.parse(result.response.text());
  }
}

// Keyword-based stand-in so the full demo works without an API key.
class DemoProvider implements AIProvider {
  async classify(input: ClassifyInput): Promise<unknown> {
    const text = input.description.toLowerCase();

    const rules = [
      { words: ["light", "lamp"], category: "streetlight", dept: "electrical_services", summary: "Streetlight is not functioning" },
      { words: ["garbage", "waste", "trash"], category: "garbage", dept: "sanitation", summary: "Garbage has accumulated" },
      { words: ["pothole"], category: "pothole", dept: "roads", summary: "Pothole on the road" },
      { words: ["drain", "sewage", "overflow"], category: "drainage", dept: "drainage_water", summary: "Drainage is overflowing" },
      { words: ["leak", "pipe", "water"], category: "water_leakage", dept: "drainage_water", summary: "Water leakage reported" },
    ];

    for (const rule of rules) {
      for (const word of rule.words) {
        if (text.includes(word)) {
          return {
            category: rule.category,
            subcategory: rule.category + "_reported",
            severity: "medium",
            summary: rule.summary,
            suggested_department_category: rule.dept,
            confidence: 0.9,
          };
        }
      }
    }

    return {
      category: "other",
      subcategory: "unclassified",
      severity: "medium",
      summary: "Needs manual review",
      suggested_department_category: "general",
      confidence: 0.3,
    };
  }
}

function getProvider(): AIProvider {
  if (process.env.AI_PROVIDER === "gemini" && process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL) {
    return new GeminiProvider();
  }
  return new DemoProvider();
}

const FALLBACK: ClassificationResult = {
  category: "other",
  subcategory: "unclassified",
  severity: "medium",
  summary: "Automatic classification unavailable",
  suggested_department_category: "general",
  confidence: 0,
};

export async function classifyComplaint(input: ClassifyInput): Promise<ClassificationResult> {
  try {
    const raw = await getProvider().classify(input);
    return ResultSchema.parse(raw);
  } catch (error) {
    console.error("Classification failed, using fallback:", error);
    return FALLBACK; // the citizen can still correct it in the UI
  }
}
