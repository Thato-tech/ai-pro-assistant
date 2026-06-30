import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type IndustryId =
  | "general"
  | "healthcare"
  | "legal"
  | "construction"
  | "education"
  | "finance"
  | "hr"
  | "engineering"
  | "marketing";

export const INDUSTRIES: { id: IndustryId; label: string; emoji: string; hint: string }[] = [
  { id: "general", label: "General", emoji: "💼", hint: "Cross-industry workplace assistant" },
  { id: "healthcare", label: "Healthcare", emoji: "🏥", hint: "Clinical, patient, and operations tone" },
  { id: "legal", label: "Legal", emoji: "⚖️", hint: "Precise, citation-aware drafting" },
  { id: "construction", label: "Construction", emoji: "🏗", hint: "Site, safety, and contractor focus" },
  { id: "education", label: "Education", emoji: "📚", hint: "Pedagogy-aware, student-focused" },
  { id: "finance", label: "Finance", emoji: "💰", hint: "Risk-aware, numbers-first" },
  { id: "hr", label: "Human Resources", emoji: "👥", hint: "People-first, policy-aware" },
  { id: "engineering", label: "Engineering", emoji: "🛠", hint: "Technical, requirement-driven" },
  { id: "marketing", label: "Marketing", emoji: "📈", hint: "Persuasive, brand-aware" },
];

type Ctx = { industry: IndustryId; setIndustry: (id: IndustryId) => void };
const IndustryContext = createContext<Ctx | null>(null);

const KEY = "professionalai.industry";

export function IndustryProvider({ children }: { children: React.ReactNode }) {
  const [industry, setIndustryState] = useState<IndustryId>("general");
  useEffect(() => {
    try {
      const v = sessionStorage.getItem(KEY) as IndustryId | null;
      if (v) setIndustryState(v);
    } catch {
      /* ignore */
    }
  }, []);
  const value = useMemo<Ctx>(
    () => ({
      industry,
      setIndustry: (id) => {
        setIndustryState(id);
        try {
          sessionStorage.setItem(KEY, id);
        } catch {
          /* ignore */
        }
      },
    }),
    [industry],
  );
  return <IndustryContext.Provider value={value}>{children}</IndustryContext.Provider>;
}

export function useIndustry() {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error("useIndustry must be inside IndustryProvider");
  return ctx;
}

export function industryLabel(id: IndustryId) {
  return INDUSTRIES.find((i) => i.id === id)?.label ?? "General";
}

export function industrySystemAddendum(id: IndustryId) {
  if (id === "general") return "";
  const map: Record<IndustryId, string> = {
    general: "",
    healthcare:
      "You are operating in HEALTHCARE mode. Use clinical, patient-respectful language. Be conservative with medical claims, never give individualized diagnosis or treatment advice, and recommend professional review for clinical decisions. Where relevant, mention HIPAA-aware privacy practices.",
    legal:
      "You are operating in LEGAL mode. Use precise legal phrasing. Flag jurisdiction dependence, avoid giving legal advice, and recommend review by qualified counsel for binding decisions.",
    construction:
      "You are operating in CONSTRUCTION mode. Use site, safety, and project terminology (RFIs, submittals, milestones, OSHA-aware safety notes). Be specific about responsibilities, deadlines, and risk.",
    education:
      "You are operating in EDUCATION mode. Use pedagogically sound language. Frame outputs around learning outcomes, accessibility, and age-appropriate communication.",
    finance:
      "You are operating in FINANCE mode. Use risk-aware, numbers-first phrasing. Quantify where possible, flag assumptions, and never give individualized investment advice.",
    hr: "You are operating in HUMAN RESOURCES mode. Use empathetic, policy-aware language. Be careful with sensitive employee topics and recommend consulting HR/legal on disputes.",
    engineering:
      "You are operating in ENGINEERING mode. Use precise, requirement-driven phrasing. Surface assumptions, constraints, and acceptance criteria.",
    marketing:
      "You are operating in MARKETING mode. Use persuasive, brand-aware language with clear CTAs while staying honest about claims and audience.",
  };
  return map[id];
}
