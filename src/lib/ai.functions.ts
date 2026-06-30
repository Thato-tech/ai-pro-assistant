import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createLovableAiGatewayProvider } from "./ai-gateway.server";
import { industrySystemAddendum, type IndustryId } from "./industry";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

const IndustryEnum = z.enum([
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

function withIndustry(base: string, industry: IndustryId | undefined) {
  const add = industrySystemAddendum(industry ?? "general");
  return add ? `${base}\n\n${add}` : base;
}

// ---------- Email ----------
const EmailInput = z.object({
  context: z.string().min(3),
  tone: z.string().min(1),
  audience: z.string().min(1),
  category: z.string().min(1),
  industry: IndustryEnum.optional(),
});
export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system: withIndustry(
        "You are a professional email writing assistant. Produce a complete, ready-to-send email with a clear Subject line, greeting, well-structured body, and sign-off. Return only the email content as Markdown — no commentary, no code fences.",
        data.industry,
      ),
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

// ---------- Meeting ----------
const MeetingInput = z.object({ notes: z.string().min(20), industry: IndustryEnum.optional() });
export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system: withIndustry(
        "You summarize meeting notes for busy professionals. Output Markdown with the following sections in order: ## Executive Summary, ## Key Discussion (bullets), ## Decisions (bullets), ## Action Items (Markdown table with columns: Owner | Task | Due Date), ## Risks / Follow-ups. Be concise and specific.",
        data.industry,
      ),
      prompt: `Meeting notes:\n\n${data.notes}`,
    });
    return { text };
  });

// ---------- Planner ----------
const PlannerInput = z.object({
  horizon: z.enum(["day", "week", "month"]),
  tasks: z.string().min(5),
  industry: IndustryEnum.optional(),
});
export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system: withIndustry(
        "You are an AI productivity planner. Given raw tasks and a planning horizon, produce a prioritized, time-blocked plan as Markdown. Sections: ## Priority Matrix (High / Medium / Low — bullets), ## Schedule (Markdown table: Time | Task | Notes), ## Smart Suggestions (3–5 productivity tips tailored to the workload). Be realistic about durations and include breaks.",
        data.industry,
      ),
      prompt: `Planning horizon: ${data.horizon}\n\nTasks & goals:\n${data.tasks}`,
    });
    return { text };
  });

// ---------- Research ----------
const ResearchInput = z.object({ topic: z.string().min(3), industry: IndustryEnum.optional() });
export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system: withIndustry(
        "You are a workplace research analyst. Produce a structured research brief in Markdown with these sections: ## Executive Summary, ## Industry Overview, ## Key Findings (bullets), ## Opportunities, ## Risks, ## Recommendations, ## Future Outlook. Be specific, factual where possible, and flag uncertainty.",
        data.industry,
      ),
      prompt: `Research topic: ${data.topic}`,
    });
    return { text };
  });

// ---------- Workflow automation: meeting -> tasks + follow-up email ----------
const WorkflowInput = z.object({
  notes: z.string().min(20),
  recipient: z.string().min(1).default("the meeting attendees"),
  industry: IndustryEnum.optional(),
});
export const runMeetingWorkflow = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => WorkflowInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const sys = withIndustry(
      "You orchestrate a meeting follow-up workflow. Return Markdown with EXACTLY these top-level sections in order and no extra preamble: ## 1. Meeting Summary, ## 2. Decisions, ## 3. Action Items (Markdown table: Owner | Task | Due Date | Priority), ## 4. Prioritized Schedule (Markdown table: Day/Time | Task | Notes), ## 5. Follow-up Email (a complete email starting with **Subject:** then a body and sign-off). Be concise and specific.",
      data.industry,
    );
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system: sys,
      prompt: `Recipient of follow-up email: ${data.recipient}\n\nRaw meeting notes:\n${data.notes}`,
    });
    return { text };
  });

// ---------- Productivity insights ----------
const InsightsInput = z.object({
  meetingsCount: z.number().int().min(0),
  meetingsHours: z.number().min(0),
  deepWorkHours: z.number().min(0),
  pendingTasks: z.number().int().min(0),
  overdueTasks: z.number().int().min(0),
  pendingEmails: z.number().int().min(0),
  industry: IndustryEnum.optional(),
});
export const getProductivityInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InsightsInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system: withIndustry(
        "You are an AI productivity coach. Given the user's day-at-a-glance metrics, return Markdown with: ## Productivity Score (a single number out of 100 with a one-line justification), ## What's Going Well (2-3 bullets), ## What To Improve (2-3 bullets), ## Top 3 Suggestions (numbered, concrete, time-bound). Be practical and specific.",
        data.industry,
      ),
      prompt: `Today's metrics:
- Meetings: ${data.meetingsCount} (${data.meetingsHours}h)
- Deep work: ${data.deepWorkHours}h
- Pending tasks: ${data.pendingTasks}
- Overdue tasks: ${data.overdueTasks}
- Pending emails: ${data.pendingEmails}`,
    });
    return { text };
  });
