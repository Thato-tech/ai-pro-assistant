import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from "@tanstack/react-start";
import { Calendar, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownResult, PageHeader } from "@/components/tool-result";
import { planSchedule } from "@/lib/ai.functions";
import { useIndustry } from "@/lib/industry";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — ProfessionalAI" },
      {
        name: "description",
        content: "Prioritize tasks and generate a time-blocked schedule with AI.",
      },
      { property: "og:title", content: "Task Planner — ProfessionalAI" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const run = useServerFn(planSchedule);
  const { industry } = useIndustry();
  const [horizon, setHorizon] = useState<"day" | "week" | "month">("day");
  const [tasks, setTasks] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tasks.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const r = await run({ data: { horizon, tasks: tasks.trim(), industry } });
      setResult(r.text);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't build plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <PageHeader
        eyebrow="Productivity"
        title="Task Planner & Scheduler"
        description="List tasks and deadlines — get a prioritized, time-blocked plan."
        icon={Calendar}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Planning horizon</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as "day" | "week" | "month")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Tasks, goals & deadlines</Label>
            <Textarea
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"E.g.\n- Finish client proposal (due Friday)\n- Prep for Monday team meeting\n- Review Q2 budget\n- 2 deep-work sessions on roadmap"}
              rows={10}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Planning…" : "Build my schedule"}
          </Button>
        </form>
        <div className="lg:col-span-3">
          <MarkdownResult content={result} emptyText="Your prioritized plan and schedule will appear here." />
        </div>
      </div>
    </div>
  );
}
