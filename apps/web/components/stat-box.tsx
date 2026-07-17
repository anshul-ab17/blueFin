import { HoverCard } from "@/components/fx";

export default function StatBox({
  value,
  label,
  valueClass = "text-fg",
}: {
  value: React.ReactNode;
  label: string;
  valueClass?: string;
}) {
  return (
    <HoverCard className="bg-panel border border-line rounded-xl p-[18px] transition-all duration-[250ms] hover:-translate-y-1 hover:border-btn-border">
      <div className="font-semibold text-xs text-dim uppercase group-hover:text-muted transition-colors duration-300">{label}</div>
      <div className={`font-heading font-bold text-2xl mt-1.5 group-hover:text-accent-soft transition-colors duration-300 ${valueClass}`}>{value}</div>
    </HoverCard>
  );
}
