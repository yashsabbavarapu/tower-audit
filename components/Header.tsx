"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UseTowerButton } from "./UseTowerButton";

const LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#why-us", label: "Why us?" },
  { href: "#customers", label: "Customers" },
  { href: "#demo", label: "Demo" },
  { href: "#writing", label: "Writing" },
];

const AUDIT_LINKS = [
  { href: "/#why-us", label: "Why us?" },
  { href: "/#vision", label: "Vision" },
  { href: "/#ai-system", label: "AI system" },
];

const WORDMARK = "font-display text-20 font-bold tracking-display text-ink";

export function Header() {
  const pathname = usePathname();

  if (pathname.startsWith("/audit")) {
    return (
      <header className="border-b border-line">
        <div className="mx-auto grid h-14 w-full max-w-column grid-cols-[1fr_auto] items-center gap-4 px-5 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className={`${WORDMARK} justify-self-start rounded-control`}>
            Tower
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-8 lg:flex">
            {AUDIT_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="readout whitespace-nowrap rounded-control text-muted transition-colors duration-press ease-out hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="readout justify-self-end whitespace-nowrap rounded-control text-muted transition-colors duration-press ease-out hover:text-ink">
            ← Overview
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-line">
      <div className="mx-auto grid h-14 w-full max-w-column grid-cols-[1fr_auto] items-center gap-4 px-5 lg:grid-cols-[1fr_auto_1fr]">
        <span className={WORDMARK}>Tower</span>
        <nav aria-label="Sections" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="readout whitespace-nowrap rounded-control text-muted transition-colors duration-press ease-out hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex justify-end">
          <UseTowerButton size="sm" label="Put it on trial" />
        </div>
      </div>
    </header>
  );
}
