import { createClient } from "@/lib/supabase/client";

export type OnlineResumeTemplate = {
  id: string;
  name: string;
  category: string;
  layout: "single" | "sidebar" | "split";
  style: "minimal" | "modern" | "classic" | "bold" | "creative";
  accent: string;
};

export async function getOnlineTemplates(): Promise<OnlineResumeTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("online_templates")
    .select("id, name, category, layout, style, accent")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load online templates:", error);
    return [];
  }

  const bases = (data ?? []) as OnlineResumeTemplate[];
  const variants = [
    { suffix: "Clean", style: "minimal" as const, layout: "single" as const, shift: 0 },
    { suffix: "Modern", style: "modern" as const, layout: "sidebar" as const, shift: 1 },
    { suffix: "Bold", style: "bold" as const, layout: "split" as const, shift: 2 },
  ];

  return bases.flatMap((base, baseIndex) =>
    variants.map((variant) => ({
      ...base,
      id: `${base.id}-${variant.suffix.toLowerCase()}`,
      name: `${base.name} ${variant.suffix}`,
      style: variant.style,
      layout: variant.layout,
      accent: [base.accent, "#4f46e5", "#0f172a", "#047857"][
        (baseIndex + variant.shift) % 4
      ],
    }))
  );
}
