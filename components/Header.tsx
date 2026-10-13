import { UseTowerButton } from "./UseTowerButton";

const LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#gtm", label: "For GTM" },
  { href: "#what-it-does", label: "What it does" },
  { href: "#demo", label: "Demo" },
  { href: "#writing", label: "Writing", wide: true },
];

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto grid h-14 w-full max-w-column grid-cols-[1fr_auto] items-center gap-4 px-5 md:grid-cols-[1fr_auto_1fr]">
        <span className="font-display text-20 font-bold tracking-display text-ink">Tower</span>
        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={`readout rounded-control text-muted transition-colors duration-press ease-out hover:text-ink${"wide" in l ? " hidden lg:inline" : ""}`}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex justify-end">
          <UseTowerButton size="sm" />
        </div>
      </div>
    </header>
  );
}
