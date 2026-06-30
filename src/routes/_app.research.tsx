import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownResult, PageHeader } from "@/components/tool-result";
import { runResearch } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — ProfessionalAI" },
      {
        name: "description",
        content: "Get a structured research brief on any topic with AI in seconds.",
      },
      { property: "og:title", content: "Research Assistant — ProfessionalAI" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(runResearch);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const r = await run({ data: { topic: topic.trim() } });
      setResult(r.text);
    } catch (err) {
      console.error(err);
      toast.error("Research failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <PageHeader
        eyebrow="Insight"
        title="Research Assistant"
        description="Get a structured brief: overview, findings, opportunities, risks, recommendations."
        icon={Search}
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Topic</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g. Renewable energy trends in Africa"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Researching…" : "Generate brief"}
          </Button>
        </div>
      </form>
      <div className="mt-6">
        <MarkdownResult content={result} emptyText="Your research brief will appear here." />
      </div>
    </div>
  );
}
