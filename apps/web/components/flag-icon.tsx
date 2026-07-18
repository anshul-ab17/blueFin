import Image from "next/image";

const FLAG_CODES: Record<string, true> = {
  ARG: true, FRA: true, BRA: true, GER: true, ENG: true, POR: true,
  ESP: true, NED: true, USA: true, MEX: true, JPN: true, KOR: true,
  ITA: true, BEL: true, CRO: true, URU: true, CAN: true, MAR: true,
};

const SIZES = {
  xs: { w: 26, h: 18 },
  sm: { w: 28, h: 20 },
  md: { w: 44, h: 30 },
  lg: { w: 56, h: 38 },
} as const;

export function hasFlag(code: string) {
  return !!FLAG_CODES[code];
}

export default function FlagIcon({
  code,
  size = "sm",
  className = "",
}: {
  code: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { w, h } = SIZES[size];
  return (
    <Image
      src={`/assets/flags/${code}.svg`}
      alt={code}
      width={w}
      height={h}
      className={`rounded-[3px] object-cover shrink-0 ${className}`}
      draggable={false}
    />
  );
}
