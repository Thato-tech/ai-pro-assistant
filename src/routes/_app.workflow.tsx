import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Zap, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownResult, PageHeader } from "@/components/tool-result";
import { runMeetingWorkflow } from "@/lib/ai.functions";
import { useIndustry } from "@/lib/industry";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/workflow")({
  head: () => ({
    meta: [
      { title: "Workflow Automation — ProfessionalAI" },
      {
        name: "description",
        content:
          "Run an end-to-end workflow: summarize a meeting, extract action items, build a schedule, and draft a follow-up email.",
      },
      { property: "og:title", content: "Workflow Automation — ProfessionalAI" },
    ],
  }),
  component: WorkflowPage,
});

const STEPS = [
  "Summarize the meeting",
  "Extract decisions",
  "Generate action items",
  "Build a prioritized schedule",
  "Draft a follow-up email",
];

function WorkflowPage() {
  const run = useServerFn(runMeetingWorkflow);
  const { industry } = useIndustry();
  const [notes, setNotes] = useState("");
  const [recipient, setRecipient] = useState("the meeting attendees");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (notes.trim().length < 20) {
      toast.error("Paste at least a few lines of meeting notes.");
      return;
    }
    setLoading(true);
    setResult("");
    // Animate the step indicator while the single AI call runs
    setActiveStep(0);
    const ticker = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 900);
    try {
      const r = await run({ data: { notes: notes.trim(), recipient: recipient.trim(), industry } });
      setResult(r.text);
      setActiveStep(STEPS.length);
    } catch (err) {
      console.error(err);
      toast.error("Workflow failed. Please try again.");
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <PageHeader
        eyebrow="Automation"
        title="Meeting → Tasks → Email"
        description="One paste, five steps. The AI summarizes, extracts decisions and action items, schedules them, and drafts a follow-up email."
        icon={Zap}
      />

      <ol className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
        {STEPS.map((s, i) => {
          const state =
            activeStep > i ? "done" : activeStep === i ? "active" : "pending";
          return (
            <li
              key={s}
              className={
                "rounded-xl border px-3 py-2.5 text-xs " +
                (state === "done"
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : state === "active"
                    ? "border-primary bg-primary/5 text-primary animate-pulse"
                    : "border-border bg-card text-muted-foreground")
              }
            >
              <div className="font-semibold">Step {i + 1}</div>
              <div className="leading-snug">{s}</div>
            </li>
          );
        })}
      </ol>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5 lg:col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Meeting notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste raw meeting notes, agenda + discussion, or a transcript…"
            rows={9}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Email recipient</Label>
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="E.g. Sarah (client), the engineering team…"
          />
        </div>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Running workflow…" : "Run workflow"}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <MarkdownResult
          content={result}
          emptyText="The summary, action items, schedule, and follow-up email will appear here."
        />
      </div>
    </div>
  );
}
