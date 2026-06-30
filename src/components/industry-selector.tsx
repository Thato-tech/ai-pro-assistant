import { Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRIES, useIndustry } from "@/lib/industry";

export function IndustrySelector({ compact = false }: { compact?: boolean }) {
  const { industry, setIndustry } = useIndustry();
  return (
    <div className="space-y-1.5">
      {!compact && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Briefcase className="h-3 w-3" /> Industry mode
        </div>
      )}
      <Select value={industry} onValueChange={(v) => setIndustry(v as never)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {INDUSTRIES.map((i) => (
            <SelectItem key={i.id} value={i.id}>
              <span className="mr-2">{i.emoji}</span>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
