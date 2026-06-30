import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { PageHeader } from "@/components/tool-result";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProfessionalAI — Workplace AI Assistant" },
      {
        name: "description",
        content:
          "ProfessionalAI helps professionals automate writing, summarize meetings, plan work, and research faster with AI.",
      },
      { property: "og:title", content: "ProfessionalAI — Workplace AI Assistant" },
      {
        property: "og:description",
        content:
          "Generate emails, summarize meetings, plan tasks, and run research — all powered by AI.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/chat",
    label: "AI Assistant",
    desc: "Chat with an AI built for work — drafting, planning, analysis.",
    icon: MessageSquare,
  },
  {
    to: "/emails",
    label: "Email Generator",
    desc: "Compose professional emails with the right tone in seconds.",
    icon: Mail,
  },
  {
    to: "/meetings",
    label: "Meeting Summarizer",
    desc: "Turn raw notes into decisions, action items, and follow-ups.",
    icon: FileText,
  },
  {
    to: "/planner",
    label: "Task Planner",
    desc: "Prioritize work and build a realistic time-blocked schedule.",
    icon: Calendar,
  },
  {
    to: "/research",
    label: "Research Assistant",
    desc: "Get structured briefs with findings, risks, and recommendations.",
    icon: Search,
  },
] as const;

function Dashboard() {
  return (
    <div className="bg-app-gradient">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-8 sm:pt-12 pb-16">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
          <Zap className="h-3.5 w-3.5" /> Welcome back
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Your AI workplace, ready when you are.
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Draft emails, summarize meetings, organize work, and research topics — all in one place.
        </p>

        <Link
          to="/chat"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
        >
          <Sparkles className="h-4 w-4" />
          Start a new conversation
          <ArrowRight className="h-4 w-4" />
        </Link>

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
      </div>
    </div>
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
    <PageHeaderWrap>
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
    </PageHeaderWrap>
  );
}

function PageHeaderWrap({ children }: { children: React.ReactNode }) {
  // small wrapper to keep margins consistent without re-importing PageHeader for non-header content
  void PageHeader;
  return <section className="mt-10">{children}</section>;
}
