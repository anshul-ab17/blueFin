export default function TeamBadge({
  code,
  color,
  size = "sm",
}: {
  code: string;
  color: string;
  size?: "xs" | "sm" | "md";
}) {
  const dims = {
    xs: "w-[26px] h-4 text-[8px]",
    sm: "w-7 h-[18px] text-[9px]",
    md: "w-[34px] h-[22px] text-[11px]",
  }[size];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[3px] text-white font-mono font-bold tracking-[0.5px] ${dims}`}
      style={{ background: color }}
    >
      {code}
    </span>
  );
}
