import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";

export function MarkdownResult({
  content,
  className,
  emptyText = "Your AI-generated result will appear here.",
}: {
  content: string;
  className?: string;
  emptyText?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  if (!content) {
    return (
      <div className={cn("rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground text-center", className)}>
        {emptyText}
      </div>
    );
  }
  return (
    <div className={cn("space-y-2", className)}>
      <AiDisclaimer />
      <div className="relative rounded-xl border border-border bg-card p-5 shadow-sm">
        <Button
          size="sm"
          variant="ghost"
          onClick={copy}
          className="absolute right-3 top-3 h-7 gap-1.5 text-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2 prose-p:leading-relaxed prose-table:text-sm">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <header className="mb-6 flex items-start gap-4">
      {Icon && (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</div>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
    </header>
  );
}
