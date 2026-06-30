import { Info } from "lucide-react";

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={
        "flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground " +
        (className ?? "")
      }
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        AI-generated content. Review before sending, sharing, or acting on it — the assistant can
        make mistakes.
      </span>
    </div>
  );
}
