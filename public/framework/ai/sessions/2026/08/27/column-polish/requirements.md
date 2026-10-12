# Column polish — core UX pass (W3)

## The ask (verbatim)

> TASK W3 — core polish of the column system, driven by today's recon findings.
>
> Read: the ranked UX recon at `public/framework/ai/2026-08-27/ux-recon/task.jsonl` with its
> screenshots beside it (41 shots, 13 ranked items); `core/Page/doc/columns.md` (including its Open
> section); `public/framework/ai/2026-08-27/column-pages-2/requirements.md` for the owner's intent
> ("just try to make the column system better. take screenshots, try to improve the ux").
>
> THE WORK, ranked:
>
> 1. **The initial void** (recon #2/#3): a columns host on a big screen shows one small column in a
>    sea of empty grey (shot finder-initial-3840.png). The doc's Open section already names the
>    untried idea: "let the last open column absorb the rest". TRY IT — the last (deepest revealed)
>    column grows into the leftover row, capped sensibly (a `large`-ish max? your measured call; a
>    `full` page already takes everything). Implement in `core/Page/Page.css` (+ class stamping in
>    Page.class.js if needed), measure at 1280/1920/3440/3840, screenshot before/after. Ship it as
>    the default ONLY if the shots clearly read better; otherwise revert to a documented no (both
>    outcomes are first-class — never leave it half-on). Prior decisions are revisable; write
>    never/always only for what breaks.
> 2. **Hover/active affordances** (recon: none on Finder nav rows or the close ×): rows and × get
>    visible hover + active states in the theme layer, consistent with the framework's existing
>    link/hover idiom (check how .page-link/.sidebar do it).
> 3. **Columns-in-a-panel fixes** (two precise findings from the uses/ builder, outside their
>    fence): (a) `.pages`' `.default` presentation rule at (0,4,0) hands an unrouted child 3em
>    padding + a 40em cap, squashing a columns host inside a panel — scope that rule so a columns
>    host is exempt; (b) `render_column()` never reads `classes`, so a non-routed columns host can't
>    be marked `default` declaratively and a panel goes silently blank — make it read them (or an
>    equivalent seam). `overview/columns/uses/split/page.js` currently works around (b) with
>    `activated(){ this.view.ac("default") }` — after your fix, verify the workaround is now
>    unnecessary but LEAVE their file alone; log it.
> 4. **Collapsed recipes** (recon: 3 of 7 example pages arrive collapsed): diagnose from the recon
>    shots + live pages, fix the cause (likely default/reveal marking), not per-page.
> 5. **Small pickups**, one edit each: `overview/columns/examples/grids/flush-wall/page.js` — swap
>    its `flush` class usage to the core `bleed` word (then delete the now-dead local rule in
>    `examples/grids/grids.css` if nothing else names it); `overview/columns/examples/looks/padding/page.js`
>    — its "Flush" recipe is NOT flush (still inset) and its verdict line claims otherwise: make the
>    recipe actually use `bleed` (or fix the verdict, whichever is honest); `core/Page/readme.md` —
>    one line each for roles (`is:`/`nearest`/`topic`/`document`) and the panels pattern, pointing at
>    `doc/roles.md`/`doc/panels.md`; `doc/columns.md` + `doc/roles.md` — link the real-world
>    exemplars at `overview/columns/uses/` (docs, inbox, workbench, split).

## Fences

- **Owned:** `core/Page/Page.class.js`, `core/Page/Page.css`, `core/Page/readme.md`,
  `core/Page/doc/**`, `core/Page/overview/columns/finder/**`, `core/Page/overview/columns/examples/**`.
- **NOT** `core/Page/generator/**` (a sibling is in it), **NOT** `overview/columns/uses/**` (log what
  their files could simplify), **NOT** `core/Page/page.js`.
- The dev server on :80 is the OWNER'S — never kill or restart it; headless read-only browsing only.
  Never drive the owner's tabs, never git stash, never commit.
- Working screenshots go to the session scratchpad (a write into `public/` fires LiveReload and
  blanks the page mid-run); keepers get copied here after the probes finish.

## Verify

Re-shoot the recon's exact top scenarios (finder initial at 1920/3440/3840, finder deep, the 7
example recipes) plus the uses/split panel; zero console errors; in-place and reveal behaviours
unregressed (deep-nav column counts unchanged from the doc'd numbers).
