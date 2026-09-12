export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
      <div>
        <p className="font-display text-xl tracking-[0.04em]">UP TOP</p>
        <p className="mt-2 text-sm text-accent-text italic">Up Top Search · Since 2020</p>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-subtle">
          Pay Up is a public reference. Posted ranges are employer statements, not offers. Up Top model figures are
          assumptions, labelled as such. Nothing here is advice for a specific negotiation.
        </p>
      </div>
      <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label="Footer">
        <a href="https://uptopsearch.com" target="_blank" rel="noopener noreferrer" className="hover:text-fg">Up Top Search</a>
        <a href="https://www.uptop.dev" target="_blank" rel="noopener noreferrer" className="hover:text-fg">Jobs</a>
        <a href="https://x.com/UpTopSearch" target="_blank" rel="noopener noreferrer" className="hover:text-fg">X</a>
        <a href="#method" className="hover:text-fg">Methodology</a>
      </nav>
    </footer>
  );
}
