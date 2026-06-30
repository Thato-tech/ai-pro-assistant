import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownResult, PageHeader } from "@/components/tool-result";
import { summarizeMeeting } from "@/lib/ai.functions";
import { useIndustry } from "@/lib/industry";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — ProfessionalAI" },
      {
        name: "description",
        content: "Turn meeting notes into decisions, action items, and follow-ups with AI.",
      },
      { property: "og:title", content: "Meeting Summarizer — ProfessionalAI" },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const { industry } = useIndustry();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (notes.trim().length < 20) {
      toast.error("Paste at least a few lines of meeting notes.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const r = await run({ data: { notes: notes.trim(), industry } });
      setResult(r.text);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <PageHeader
        eyebrow="Document Intelligence"
        title="Meeting Notes Summarizer"
        description="Paste raw notes — get a clean summary, decisions, action items, and risks."
        icon={FileText}
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Meeting notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste raw notes, a transcript, or your shorthand…"
            rows={10}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Summarizing…" : "Summarize"}
          </Button>
        </div>
      </form>
      <div className="mt-6">
        <MarkdownResult content={result} emptyText="Your summary, decisions, and action items will appear here." />
      </div>
    </div>
  );
}
