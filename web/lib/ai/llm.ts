// Server-side LLM client. Two providers, chosen with LLM_PROVIDER:
//   ollama (default): local server at OLLAMA_URL, no API key needed.
//   groq: hosted, needs GROQ_API_KEY.
// Never import this from client components.

export class AiNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiNotConfiguredError";
  }
}

type Provider = "ollama" | "groq";

function provider(): Provider {
  return process.env.LLM_PROVIDER === "groq" ? "groq" : "ollama";
}

function model(): string {
  if (process.env.LLM_MODEL) return process.env.LLM_MODEL;
  return provider() === "groq" ? "llama-3.1-8b-instant" : "qwen2.5:7b";
}

export async function askLlm(system: string, user: string): Promise<string> {
  return provider() === "groq" ? askGroq(system, user) : askOllama(system, user);
}

async function askOllama(system: string, user: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: model(),
        stream: false,
        // Turns off the reasoning output of models such as qwen3, so only the answer is returned.
        think: false,
        format: "json",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    throw new AiNotConfiguredError(`Ollama is not reachable at ${baseUrl}. Start it with: ollama serve`);
  }

  if (!response.ok) throw new Error(`Ollama request failed with status ${response.status}`);
  const data = (await response.json()) as { message?: { content?: string } };
  return data.message?.content ?? "";
}

async function askGroq(system: string, user: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError("GROQ_API_KEY is not set on the server.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model(),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Groq request failed with status ${response.status}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}
