import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts/build";
import { checkLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const client = new Anthropic(); // يقرأ ANTHROPIC_API_KEY

const schema = z.object({
  text: z.string().min(10).max(8000),
  source: z.enum(["ar", "fr", "en"]),
  target: z.enum(["ar", "fr", "en"]),
  uiLang: z.enum(["ar", "fr", "en"]),
  docType: z.enum(["cv","motivation_letter","admin_request","university_doc","contract","technical"]),
  tone: z.enum(["formal","administrative","academic","professional"]),
  mode: z.enum(["TRANSLATE","TRANSLATE_AND_REFINE"]),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok, remaining } = await checkLimit(ip);
  if (!ok) return Response.json({ error: "limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || parsed.data.source === parsed.data.target)
    return Response.json({ error: "invalid" }, { status: 400 });
  const d = parsed.data;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: buildSystemPrompt(d),
    messages: [{ role: "user", content: buildUserMessage(d) }],
  });

  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(c) {
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta")
            c.enqueue(enc.encode(ev.delta.text));
        }
        c.close();
      } catch (e) { c.error(e); }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Remaining": String(remaining) },
  });
}
