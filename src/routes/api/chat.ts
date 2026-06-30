import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CHAT_MODEL, createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; industry?: string };
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const industryNote =
          body.industry && body.industry !== "general"
            ? ` The user is currently in ${body.industry.toUpperCase()} industry mode — tailor terminology, examples, and tone accordingly.`
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
