/**
 * Thin OpenAI-compatible chat client.
 *
 * Every AI feature in the product funnels through `chatCompletion` so the
 * provider is configured in exactly one place.
 */

const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
const apiKey = process.env.AI_API_KEY;
const model = process.env.AI_MODEL ?? "gpt-4o-mini";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const aiConfigured = Boolean(apiKey);

export class AiError extends Error {}

async function chatCompletion(
  messages: ChatMessage[],
  options: { json?: boolean; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  if (!apiKey) {
    throw new AiError(
      "AI_API_KEY is not set. Add it to .env (see .env.example)."
    );
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new AiError(`AI request failed (${response.status}): ${detail}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.length === 0) {
    throw new AiError("AI request returned an empty response.");
  }

  return content;
}

export function extractJson<T>(raw: string): T {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);

  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");

    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    }

    throw new AiError("AI response was not valid JSON.");
  }
}

export { chatCompletion };