import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Eye, Lock, Scale, AlertTriangle, Accessibility } from "lucide-react";
import { PageHeader } from "@/components/tool-result";

export const Route = createFileRoute("/_app/responsible")({
  head: () => ({
    meta: [
      { title: "Responsible AI — ProfessionalAI" },
      {
        name: "description",
        content:
          "How ProfessionalAI handles transparency, human oversight, privacy, bias, accessibility, and known limitations.",
      },
      { property: "og:title", content: "Responsible AI — ProfessionalAI" },
    ],
  }),
  component: ResponsibleAIPage,
});

const principles = [
  {
    icon: Eye,
    title: "Transparency",
    body: "Every AI-generated output is labeled. You always know when content was written or suggested by AI, not a human.",
  },
  {
    icon: ShieldCheck,
    title: "Human oversight",
    body: "ProfessionalAI proposes — you decide. Emails, plans, and summaries are drafts for you to review, edit, and approve before they go anywhere.",
  },
  {
    icon: Lock,
    title: "Privacy",
    body: "This preview is session-only. Nothing you type is persisted across reloads. When persistence is added later, your data stays scoped to your account.",
  },
  {
    icon: Scale,
    title: "Fairness & bias",
    body: "Large language models can reflect biases from their training data. Treat AI output as a starting point and review for tone, fairness, and accuracy.",
  },
  {
    icon: AlertTriangle,
    title: "Honest limitations",
    body: "AI can hallucinate facts, miss nuance, or be out of date. For legal, medical, financial, or safety-critical decisions, get a qualified human review.",
  },
  {
    icon: Accessibility,
    title: "Accessibility",
    body: "Keyboard navigation, semantic HTML, and a responsive layout from phone to desktop are first-class — not afterthoughts.",
  },
];

function ResponsibleAIPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-8">
      <PageHeader
        eyebrow="Trust"
        title="Responsible AI"
        description="How we think about transparency, oversight, privacy, and limitations in ProfessionalAI."
        icon={ShieldCheck}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {principles.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <div className="font-display font-semibold">{p.title}</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-base font-semibold">Known limitations</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>AI may generate inaccurate or incomplete information ("hallucinations").</li>
          <li>Research quality depends on what the underlying model has seen.</li>
          <li>Large documents may take longer to process.</li>
          <li>Industry, regulatory, and legal claims require human verification.</li>
          <li>This preview keeps data in-memory only — refreshing the page clears your session.</li>
        </ul>
      </section>
    </div>
  );
}
