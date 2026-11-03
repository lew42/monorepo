# web-layout-repair

Dispatched by `mastermind-layout` (2026-08-16 cycle 21): "Repair the worst
`/web/layout` pages (flex 9, screens 17, respond 18)."

## The ask, verbatim

> Three badly-scoring pages, and one of them is the interesting case.
> `ext/LayoutTool`'s site audit ranks every page by `analyze()` — what is
> broken. Excluding the deliberate traps in `library/bad/*`, these are among
> the worst on the site: `/web/layout/flex/` (F9 at both 1280 and 3440),
> `/web/layout/screens/` (F17 at 1280), `/web/layout/respond/` (F18 at 1280).
> Site median is ~80.
>
> `/web/layout/flex/` is the interesting one: the taste tier rates it D67
> (proportions and typography fine) while `analyze()` calls it F9. Diagnose
> that gap before touching anything — the answer tells us whether the other
> two share a cause.

## Scope / fence

May write only: files under `public/web/layout/`, and this task dir.
Must NOT touch: `public/framework/**` (the tool is the instrument, not the
subject), `framework.css`, `/styles.css`, `public/web/nav/**` (owned by a
sibling agent this cycle), `public/framework/ext/Panel/**`.

## Proposed steps

1. Read `ext/LayoutTool/audit/findings.json` for the three pages' leading
   issues.
2. Reproduce live with `analyze()` at 1280 and 3440 for each page.
3. Screenshot each page at 390 / 1280 / 3440 to see it as a human would.
4. Diagnose the flex F9-vs-D67 gap specifically — is it a real defect, a
   false positive, or a deliberate "bad example" the prose calls out?
5. Apply the same diagnosis lens to screens/ and respond/ — same cause or
   different?
6. Fix at the correct rung of the CSS ladder, inside the fence only. Escalate
   (don't silently override) anything that traces to `framework.css`.
7. Re-measure: before/after `analyze()` score + grade + high count at 1280
   and 3440, before/after screenshots.
8. Land: log findings, note any false positive or deliberate-bad-example,
   link pages from wherever a reader would already be.
