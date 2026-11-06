import clsx from "clsx";

/**
 * One full-screen "card" in the stack. It pins while the next panel slides
 * over it (driven by <Stack>). `id` is put on a marker before the panel so
 * anchor links land on the panel's natural position, not its pinned one.
 */
export default function Panel({
  id, dot = true, fit = false, className, children,
}: { id: string; dot?: boolean; /** size to content instead of a full screen (e.g. the footer) */ fit?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <>
      <div id={id} aria-hidden className="h-0" />
      <section data-panel data-id={id} data-dot={dot ? "" : undefined} className={clsx("panel", fit && "panel-fit")}>
        <div data-panel-inner className={clsx("panel-inner", className)}>{children}</div>
        <div aria-hidden className="panel-shade" />
      </section>
    </>
  );
}
