export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatWithDeepSeek(messages: ChatMessage[]): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || key.includes("your-deepseek")) {
    throw new Error("DEEPSEEK_API_KEY_NOT_SET");
  }
  const base = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DEEPSEEK_ERROR: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}
