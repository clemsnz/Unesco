"use client";

type W = Window & { __lenis?: { scrollTo: (t: number, o?: object) => void } };

export default function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="cartel link-underline hover:text-ivory"
      onClick={() => {
        const lenis = (window as W).__lenis;
        if (lenis) lenis.scrollTo(0, { duration: 1.6 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {label} ↑
    </button>
  );
}
