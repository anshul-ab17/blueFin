export default function LiveDot({ size = 7 }: { size?: number }) {
  return (
    <span
      className="rounded-full bg-live animate-livepulse inline-block shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
