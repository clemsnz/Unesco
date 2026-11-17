import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "light" | "dark";
  external?: boolean;
  download?: boolean;
  className?: string;
};

/** Square-edged button whose fill rises on hover. */
export default function Button({ href, children, variant = "light", external, download, className = "" }: Props) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden border px-6 py-4 cartel transition-colors duration-500 ease-[var(--ease-luxe)]";
  const tone =
    variant === "light"
      ? "border-ivory/40 text-ivory hover:text-night"
      : "border-night/30 text-night hover:text-ivory";
  const fill = variant === "light" ? "bg-ivory" : "bg-night";
  const inner = (
    <>
      <span aria-hidden className={`absolute inset-0 translate-y-full ${fill} transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-y-0`} />
      <span className="relative">{children}</span>
      <span aria-hidden className="relative transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1">
        {download ? "↓" : external ? "↗" : "→"}
      </span>
    </>
  );
  const cls = `${base} ${tone} ${className}`;
  if (external || download || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...(download ? { download: true } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
