

import config from "../config/config";

const apiKey = config.OPENROUTER_API_KEY

if(!apiKey) {
    throw new Error('Open ai key not loaded')
}

export async function generateWithOpenRouter(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8192,
      response_format: { type: "json_object" },
      reasoning: { effort: "low" },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const err = new Error(
      `OpenRouter request failed (${res.status}): ${await res.text()}`
    ) as Error & { statusCode?: number };
    err.statusCode = res.status === 429 ? 503 : 502;
    throw err;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    const err = new Error("OpenRouter returned an empty response") as Error & { statusCode?: number };
    err.statusCode = 502;
    throw err;
  }
  return text;
}