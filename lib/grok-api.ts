/**
 * Groq API Client for message matching and AI auto-reply
 * Uses Vercel AI SDK with Groq provider for structured outputs
 */

import { createGroq } from "@ai-sdk/groq";
import { generateObject, generateText } from "ai";
import { z } from "zod";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// Create Groq instance with API key
const groq = createGroq({
  apiKey: GROQ_API_KEY,
});

// Model to use - llama-3.1-8b-instant is fast and efficient for this use case
const GROQ_MODEL = "llama-3.1-8b-instant";

// Define the expected response schema
const MatchResultSchema = z.object({
  matched_response_index: z
    .number()
    .nullable()
    .describe(
      "0-based index of the matched response, or null if no good match",
    ),
  confidence_score: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence score from 0 to 100"),
  reasoning: z
    .string()
    .describe(
      "Brief explanation of why this response was chosen or not chosen",
    ),
});

export interface GrokMatchResult {
  matched_response_index: number | null;
  confidence_score: number;
  reasoning: string;
}

export interface GrokApiError {
  error: string;
  details?: any;
}

/**
 * Match a user message to the best predefined response using Groq API with structured outputs
 *
 * @param userMessage - The incoming message from the user
 * @param responses - Array of predefined response texts
 * @returns Promise with match result including confidence score
 */
export async function matchMessageToResponse(
  userMessage: string,
  responses: string[],
): Promise<GrokMatchResult> {
  try {
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not configured");
      return {
        matched_response_index: null,
        confidence_score: 0,
        reasoning: "Groq API key not configured",
      };
    }

    if (responses.length === 0) {
      console.warn("⚠️ No responses provided for matching");
      return {
        matched_response_index: null,
        confidence_score: 0,
        reasoning: "No responses available",
      };
    }

    // Build the prompt for Groq
    // We add explicit JSON instructions since 8b model doesn't support json_schema mode
    const systemPrompt = `You are an AI assistant helping to match customer messages with appropriate predefined responses.
You must output a valid JSON object matching this schema:
{
  "matched_response_index": number | null, // 0-based index or null
  "confidence_score": number, // 0-100
  "reasoning": string // Explanation
}`;

    // Call Groq API with text generation
    const { text } = await generateText({
      model: groq(GROQ_MODEL),
      system: systemPrompt,
      prompt: buildMatchingPrompt(userMessage, responses),
    });

    // Parse the JSON response manually
    const matchResult = parseGrokResponse(text);

    return matchResult;
  } catch (error) {
    console.error("❌ Error calling Groq API:", error);

    // Return a safe default on error
    return {
      matched_response_index: null,
      confidence_score: 0,
      reasoning:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Build the prompt for Groq API to match user message with responses
 */
function buildMatchingPrompt(userMessage: string, responses: string[]): string {
  return `Customer Message: "${userMessage}"

Available Responses:
${responses.map((r, i) => `${i}. ${r}`).join("\n")}

Task: Analyze the customer message and determine which response (if any) is the best match.

Rules:
- If no response matches well, set matched_response_index to null
- Consider context, intent, and semantic meaning, not just keywords
- Be selective - only match if you're confident (70%+)`;
}

/**
 * For backwards compatibility - parse raw response if needed
 * This is kept for any legacy usage but SDK handles this automatically now
 */
export function parseGrokResponse(rawResponse: string): GrokMatchResult {
  try {
    let jsonStr = rawResponse.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    return {
      matched_response_index: parsed.matched_response_index ?? null,
      confidence_score: Math.max(
        0,
        Math.min(100, parsed.confidence_score || 0),
      ),
      reasoning: parsed.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("❌ Error parsing response:", error);
    return {
      matched_response_index: null,
      confidence_score: 0,
      reasoning: `Failed to parse response: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
