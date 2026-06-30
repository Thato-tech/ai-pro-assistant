import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  FileText,
  Mail,
  MessageSquare,
  Search,
  LayoutDashboard,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

type Route = "/" | "/chat" | "/emails" | "/meetings" | "/planner" | "/research" | "/workflow" | "/responsible";

const PAGES: { to: Route; label: string; icon: React.ComponentType<{ className?: string }>; keywords: string }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, keywords: "home overview insights productivity" },
  { to: "/chat", label: "AI Assistant", icon: MessageSquare, keywords: "chat ask question" },
  { to: "/emails", label: "Email Generator", icon: Mail, keywords: "draft email reply follow-up" },
  { to: "/meetings", label: "Meeting Summarizer", icon: FileText, keywords: "summarize notes meeting minutes" },
  { to: "/planner", label: "Task Planner", icon: Calendar, keywords: "plan schedule week day prioritize" },
  { to: "/research", label: "Research Assistant", icon: Search, keywords: "research brief analyze" },
  { to: "/workflow", label: "Meeting → Tasks → Email workflow", icon: Zap, keywords: "automation workflow chain" },
  { to: "/responsible", label: "Responsible AI", icon: ShieldCheck, keywords: "ethics privacy limitations" },
];

const QUICK: { label: string; to: Route; q?: string; keywords: string }[] = [
  { label: "Draft a follow-up email", to: "/emails", keywords: "email write" },
  { label: "Summarize meeting notes", to: "/meetings", keywords: "meeting summary" },
  { label: "Plan my week", to: "/planner", keywords: "schedule plan" },
  { label: "Research a topic", to: "/research", keywords: "research" },
  { label: "Ask the AI Assistant", to: "/chat", keywords: "chat" },
];

function matchRoute(query: string): { to: Route; q?: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  if (/\b(email|draft|reply|follow.?up|thank|reminder)\b/.test(q)) return { to: "/emails" };
  if (/\b(summari[sz]e|meeting|notes|minutes|transcript)\b/.test(q)) return { to: "/meetings" };
  if (/\b(plan|schedule|prioriti[sz]e|week|day|task|deadline)\b/.test(q)) return { to: "/planner" };
  if (/\b(research|brief|analy[sz]e|overview|trends?)\b/.test(q)) return { to: "/research" };
  if (/\b(workflow|automate|chain|end.?to.?end)\b/.test(q)) return { to: "/workflow" };
  // default: send to chat with the query as the seed prompt
  return { to: "/chat", q: query };
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: Route, q?: string) => {
    setOpen(false);
    setValue("");
    if (q) navigate({ to, search: { q } as never });
    else navigate({ to });
  };

  const sendToAI = () => {
    const route = matchRoute(value);
    if (route) go(route.to, route.q);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={value}
          onValueChange={setValue}
          placeholder="Type a command or ask the AI… (e.g. 'plan my week')"
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim() && !e.defaultPrevented) {
              // If no item is highlighted (rare), route directly
              setTimeout(sendToAI, 0);
            }
          }}
        />
        <CommandList>
          <CommandEmpty>
            <button
              onClick={sendToAI}
              className="text-sm text-primary hover:underline"
            >
              Send "{value}" to AI Assistant →
            </button>
          </CommandEmpty>
          {value.trim() && (
            <CommandGroup heading="Ask the AI">
              <CommandItem value={`ask:${value}`} onSelect={sendToAI}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send "{value}" to AI Assistant
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading="Quick actions">
            {QUICK.map((q) => (
              <CommandItem
                key={q.label}
                value={`${q.label} ${q.keywords}`}
                onSelect={() => go(q.to)}
              >
                <Zap className="mr-2 h-4 w-4 text-primary" />
                {q.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            {PAGES.map((p) => (
              <CommandItem
                key={p.to}
                value={`${p.label} ${p.keywords}`}
                onSelect={() => go(p.to)}
              >
                <p.icon className="mr-2 h-4 w-4" />
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function CommandTrigger() {
  return (
    <button
      onClick={() => {
        const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
        window.dispatchEvent(ev);
      }}
      className="hidden md:inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 transition"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search or ask…</span>
      <kbd className="ml-2 hidden sm:inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
        ⌘K
      </kbd>
    </button>
  );
}
