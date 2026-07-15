export default function StatBox({
  value,
  label,
  valueClass = "text-fg",
}: {
  value: string | number;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-panel border border-line rounded-xl p-[18px]">
      <div className="font-semibold text-xs text-dim uppercase">{label}</div>
      <div className={`font-heading font-bold text-2xl mt-1.5 ${valueClass}`}>{value}</div>
    </div>
  );
}
