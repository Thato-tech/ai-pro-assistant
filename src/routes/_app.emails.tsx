import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownResult, PageHeader } from "@/components/tool-result";
import { generateEmail } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/emails")({
  head: () => ({
    meta: [
      { title: "Email Generator — ProfessionalAI" },
      {
        name: "description",
        content:
          "Generate professional emails with the right tone and audience in seconds with AI.",
      },
      { property: "og:title", content: "Email Generator — ProfessionalAI" },
    ],
  }),
  component: EmailPage,
});

const CATEGORIES = [
  "Follow-up",
  "Client communication",
  "Internal team update",
  "Meeting invitation",
  "Project update",
  "Complaint response",
  "Thank-you",
  "Proposal",
  "Reminder",
];
const TONES = ["Professional", "Formal", "Friendly", "Informal", "Persuasive", "Confident", "Empathetic", "Diplomatic"];
const AUDIENCES = ["Client", "Manager", "Executive", "Colleague", "Team", "Supplier", "Customer"];

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [category, setCategory] = useState("Follow-up");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Client");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!context.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const r = await run({ data: { category, tone, audience, context: context.trim() } });
      setResult(r.text);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <PageHeader
        eyebrow="Smart Writing"
        title="Email Generator"
        description="Describe the situation — get a polished, ready-to-send email."
        icon={Mail}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Field label="Category">
            <SelectField value={category} onChange={setCategory} options={CATEGORIES} />
          </Field>
          <Field label="Tone">
            <SelectField value={tone} onChange={setTone} options={TONES} />
          </Field>
          <Field label="Audience">
            <SelectField value={audience} onChange={setAudience} options={AUDIENCES} />
          </Field>
          <Field label="Context / what to say">
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g. Follow up with Sarah after today's project meeting. Confirm next milestone by Friday."
              rows={6}
              required
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate email"}
          </Button>
        </form>
        <div className="lg:col-span-3">
          <MarkdownResult content={result} emptyText="Fill in the form and your generated email will appear here." />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// silence unused-import linter for the Input import we keep for future fields
void Input;
