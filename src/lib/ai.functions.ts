import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createLovableAiGatewayProvider } from "./ai-gateway.server";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

// ---------- Email Generator ----------
const EmailInput = z.object({
  context: z.string().min(3),
  tone: z.string().min(1),
  audience: z.string().min(1),
  category: z.string().min(1),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system:
        "You are a professional email writing assistant. Produce a complete, ready-to-send email with a clear Subject line, greeting, well-structured body, and sign-off. Return only the email content as Markdown — no commentary, no code fences.",
      prompt: `Write a ${data.category} email.
Tone: ${data.tone}
Audience: ${data.audience}
Context / Goal: ${data.context}

Format:
**Subject:** <subject>

<body>

Kind regards,
<your name>`,
    });
    return { text };
  });

// ---------- Meeting Notes Summarizer ----------
const MeetingInput = z.object({ notes: z.string().min(20) });
export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system:
        "You summarize meeting notes for busy professionals. Output Markdown with the following sections in order: ## Executive Summary, ## Key Discussion (bullets), ## Decisions (bullets), ## Action Items (Markdown table with columns: Owner | Task | Due Date), ## Risks / Follow-ups. Be concise and specific.",
      prompt: `Meeting notes:\n\n${data.notes}`,
    });
    return { text };
  });

// ---------- Task Planner ----------
const PlannerInput = z.object({
  horizon: z.enum(["day", "week", "month"]),
  tasks: z.string().min(5),
});
export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system:
        "You are an AI productivity planner. Given raw tasks and a planning horizon, produce a prioritized, time-blocked plan as Markdown. Sections: ## Priority Matrix (High / Medium / Low — bullets), ## Schedule (Markdown table: Time | Task | Notes), ## Smart Suggestions (3–5 productivity tips tailored to the workload). Be realistic about durations and include breaks.",
      prompt: `Planning horizon: ${data.horizon}\n\nTasks & goals:\n${data.tasks}`,
    });
    return { text };
  });

// ---------- Research Assistant ----------
const ResearchInput = z.object({ topic: z.string().min(3) });
export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system:
        "You are a workplace research analyst. Produce a structured research brief in Markdown with these sections: ## Executive Summary, ## Industry Overview, ## Key Findings (bullets), ## Opportunities, ## Risks, ## Recommendations, ## Future Outlook. Be specific, factual where possible, and flag uncertainty.",
      prompt: `Research topic: ${data.topic}`,
    });
    return { text };
  });
