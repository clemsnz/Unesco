"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion";

/**
 * Custom cursor (desktop, fine pointers only).
 * Any element with data-cursor="Label" turns the ring into a labelled disc.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !ring.current || !dot.current) return;
    const r = ring.current;
    const d = dot.current;
    gsap.set([r, d], { xPercent: -50, yPercent: -50, opacity: 0 });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    let visible = false;

    const move = (e: PointerEvent) => {
      if (!visible) {
        gsap.to([r, d], { opacity: 1, duration: 0.3 });
        visible = true;
      }
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setLabel(labelled.dataset.cursor || "");
        setHover(false);
        return;
      }
      setLabel("");
      setHover(!!target?.closest("a, button, [role='button'], input, textarea, select, label"));
    };
    const leave = () => {
      gsap.to([r, d], { opacity: 0, duration: 0.3 });
      visible = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.classList.add("has-cursor");
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const labelled = label.length > 0;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]">
      <div
        ref={ring}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-500 ease-[var(--ease-luxe)]"
        style={{
          width: labelled ? 104 : hover ? 54 : 34,
          height: labelled ? 104 : hover ? 54 : 34,
          border: labelled ? "1px solid transparent" : "1px solid rgba(216,196,160,0.7)",
          background: labelled ? "var(--color-champagne)" : "transparent",
        }}
      >
        <span
          className="cartel text-center text-[0.6rem] leading-tight text-night transition-opacity duration-300"
          style={{ opacity: labelled ? 1 : 0 }}
        >
          {label}
        </span>
      </div>
      <div
        ref={dot}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-champagne-soft transition-opacity duration-300"
        style={{ opacity: labelled ? 0 : 1 }}
      />
    </div>
  );
}
