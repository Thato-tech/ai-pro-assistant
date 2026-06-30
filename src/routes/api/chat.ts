import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CHAT_MODEL, createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit.server";

const VALID_INDUSTRIES = new Set([
  "general",
  "healthcare",
  "legal",
  "construction",
  "education",
  "finance",
  "hr",
  "engineering",
  "marketing",
]);

const MAX_MESSAGES = 40;
const MAX_CHARS_PER_MESSAGE = 8000;
const MAX_TOTAL_CHARS = 60000;

function partsText(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  let s = "";
  for (const p of parts) {
    if (p && typeof p === "object" && "text" in (p as Record<string, unknown>)) {
      const t = (p as { text?: unknown }).text;
      if (typeof t === "string") s += t;
    }
  }
  return s;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Cost-bounding rate limit (best-effort; session-only app, no auth).
        const ip = getClientIp(request);
        const rl = checkRateLimit(`chat:${ip}`);
        if (!rl.ok) return rateLimitResponse(rl.retryAfter);

        let body: { messages?: UIMessage[]; industry?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (messages.length === 0 || messages.length > MAX_MESSAGES) {
          return new Response("Invalid message count", { status: 400 });
        }
        let total = 0;
        for (const m of messages) {
          const text = partsText((m as { parts?: unknown }).parts);
          if (text.length > MAX_CHARS_PER_MESSAGE) {
            return new Response("Message too long", { status: 413 });
          }
          total += text.length;
        }
        if (total > MAX_TOTAL_CHARS) {
          return new Response("Conversation too large", { status: 413 });
        }

        // Allow-list industry to prevent prompt injection via this field.
        const industry =
          typeof body.industry === "string" && VALID_INDUSTRIES.has(body.industry)
            ? body.industry
            : "general";

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const industryNote =
          industry !== "general"
            ? ` The user is currently in ${industry.toUpperCase()} industry mode — tailor terminology, examples, and tone accordingly.`
            : "";

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(CHAT_MODEL),
          system:
            "You are ProfessionalAI, a workplace assistant for professionals. Be concise, practical, and structured. Use Markdown (headings, bullets, tables) when it improves clarity. When drafting documents, give a complete deliverable rather than describing one." +
            industryNote,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
