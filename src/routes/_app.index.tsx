import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Mail,
  FileText,
  Calendar,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Clock,
  Loader2,
  Command as CommandIcon,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/tool-result";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { getProductivityInsights } from "@/lib/ai.functions";
import { useIndustry, industryLabel } from "@/lib/industry";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ProfessionalAI" },
      {
        name: "description",
        content:
          "Your AI workplace at a glance: today's tasks, meetings, productivity score, and quick access to every tool.",
      },
      { property: "og:title", content: "Dashboard — ProfessionalAI" },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/chat", label: "AI Assistant", desc: "Chat with an AI built for work.", icon: MessageSquare },
  { to: "/emails", label: "Email Generator", desc: "Polished emails in seconds.", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", desc: "Notes → decisions, action items.", icon: FileText },
  { to: "/planner", label: "Task Planner", desc: "Prioritized, time-blocked schedule.", icon: Calendar },
  { to: "/research", label: "Research Assistant", desc: "Structured briefs in minutes.", icon: Search },
  { to: "/workflow", label: "Workflow Automation", desc: "Meeting → tasks → email in one run.", icon: Zap },
] as const;

// Mock day-at-a-glance metrics — would come from real data in v2
const TODAY = {
  meetingsCount: 4,
  meetingsHours: 3.5,
  deepWorkHours: 2,
  pendingTasks: 6,
  overdueTasks: 1,
  pendingEmails: 12,
};

function Dashboard() {
  const { industry } = useIndustry();
  return (
    <div className="bg-app-gradient">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-8 sm:pt-12 pb-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
              <Zap className="h-3.5 w-3.5" /> {industryLabel(industry)} mode
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Your AI workplace, ready when you are.
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Draft emails, summarize meetings, organize work, run research, and chain it all together.
            </p>
          </div>

          <CommandHint />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
          >
            <Sparkles className="h-4 w-4" />
            Start a new conversation
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/workflow"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:border-primary/40 transition"
          >
            <Zap className="h-4 w-4 text-primary" />
            Run a workflow
          </Link>
        </div>

        <ProductivitySection />

        <section className="mt-10">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((t, i) => (
              <motion.div
                key={t.to}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  to={t.to}
                  className="group block h-full rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <div className="font-display font-semibold">{t.label}</div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <SuggestionsPanel />

        <section className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-sm flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold">Built with responsible AI in mind</div>
            <p className="text-sm text-muted-foreground mt-1">
              Every AI output is clearly labeled. You stay in control: review, edit, and approve
              before anything goes out.
            </p>
            <Link
              to="/responsible"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary"
            >
              Read our approach <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function CommandHint() {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground flex items-center gap-2.5">
      <CommandIcon className="h-3.5 w-3.5 text-primary" />
      <span>
        AI Command Center —{" "}
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> or{" "}
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
      </span>
    </div>
  );
}

function ProductivitySection() {
  const { industry } = useIndustry();
  const run = useServerFn(getProductivityInsights);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState("");

  const stats = useMemo(
    () => [
      { label: "Meetings today", value: TODAY.meetingsCount, sub: `${TODAY.meetingsHours}h` },
      { label: "Deep work", value: `${TODAY.deepWorkHours}h`, sub: "scheduled" },
      { label: "Pending tasks", value: TODAY.pendingTasks, sub: `${TODAY.overdueTasks} overdue` },
      { label: "Inbox", value: TODAY.pendingEmails, sub: "to triage" },
    ],
    [],
  );

  async function generate() {
    setLoading(true);
    try {
      const r = await run({ data: { ...TODAY, industry } });
      setInsights(r.text);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Productivity dashboard
          </div>
          <h2 className="font-display text-xl font-semibold mt-1">Your day at a glance</h2>
        </div>
        <Button onClick={generate} disabled={loading} size="sm" className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing…" : insights ? "Refresh insights" : "Get AI insights"}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {s.sub}
            </div>
          </div>
        ))}
      </div>

      {insights && (
        <div className="mt-4 space-y-2">
          <AiDisclaimer />
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-h2:text-base prose-h2:mt-3 prose-h2:mb-2">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </article>
          </div>
        </div>
      )}
    </section>
  );
}

function SuggestionsPanel() {
  const suggestions = [
    "Draft a follow-up email after today's client meeting",
    "Summarize these meeting notes into decisions and action items",
    "Plan my week based on these tasks and deadlines",
    "Research renewable energy trends in Africa",
  ];
  return (
    <section className="mt-10">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Try asking
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((s) => (
          <Link
            key={s}
            to="/chat"
            search={{ q: s } as never}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:bg-accent/40 transition"
          >
            {s}
          </Link>
        ))}
      </div>
      {/* unused-import guard */}
      <span className="hidden">{PageHeader.name}</span>
    </section>
  );
}
