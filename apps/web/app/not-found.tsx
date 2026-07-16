import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/bg/error.webp')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,31,0.5)_0%,rgba(10,20,31,0.75)_60%,#0a141f_100%)]" />
      <div className="relative text-center px-6 pb-10">
        <div className="font-heading font-bold text-[96px] leading-none text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.6)]">404</div>
        <h1 className="font-heading font-bold text-[26px] text-fg m-0 mb-2">Lost in deep water.</h1>
        <p className="font-medium text-[15px] text-soft-fg m-0 mb-7 max-w-[420px] mx-auto">
          This page doesn&apos;t exist — the current must have carried you off course.
        </p>
        <Link
          href="/"
          className="inline-block bg-white !text-abyss font-extrabold text-xs tracking-[1.5px] uppercase px-[22px] py-[13px] rounded-[10px] no-underline hover:!text-accent"
        >
          Swim back home
        </Link>
      </div>
    </div>
  );
}
