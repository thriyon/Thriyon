import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/8 px-6 pt-20 pb-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.04em]">
              THRIYON
            </div>
            <p className="mt-6 max-w-sm text-sm text-muted-foreground">
              An operating system for the world's most ambitious creative
              practitioners. Invite-only. Quietly powerful.
            </p>
          </div>
          <FooterCol title="Platform" items={[
            ["Talent", "/talent"],
            ["Projects", "/projects"],
            ["Showcase", "/showcase"],
            ["Pricing", "/pricing"],
          ]} />
          <FooterCol title="Studio" items={[
            ["About", "/about"],
            ["Method", "/how-it-works"],
            ["Journal", "/journal"],
            ["Contact", "/contact"],
          ]} />
          <FooterCol title="System" items={[
            ["Sign in", "/contact"],
            ["Request access", "/contact"],
            ["Press", "/contact"],
            ["Legal", "/contact"],
          ]} />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/6 pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Thriyon Systems · All rights reserved</span>
          <span className="font-mono tracking-widest">v 1.0 · SOVEREIGN BUILD</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-2.5 text-sm">
        {items.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-foreground/80 transition hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
