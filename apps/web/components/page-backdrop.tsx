// Fixed full-viewport background image with a dark fade so panels stay readable.
export default function PageBackdrop({ src, opacity = 0.45 }: { src: string; opacity?: number }) {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${src}')`, opacity }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,31,0.55)_0%,rgba(10,20,31,0.8)_55%,rgba(10,20,31,0.95)_100%)]" />
    </div>
  );
}
