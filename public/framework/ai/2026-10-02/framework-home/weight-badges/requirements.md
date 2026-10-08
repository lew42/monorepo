# /framework/ card size + unread badges: requirements

Owner follow-up (vscode-mastermind), after the framework-home sections landed:

> 1. Card size follows weight: big modules (high weight, e.g. core/Page, Item, List, View)
>    get bigger cards that show their core API (the first lines of the readme's
>    `## Architecture` block, read live, never copied). Small modules are icon plus name only.
> 2. Unread badges, rolled up: each card shows how many unread Inbox items belong to that
>    module. The sidebar's Framework link shows the total, so a click drills down:
>    Framework (3) → the modules with items → the module's inbox, newest first, so the
>    owner picks up where they left off. The per-module unread data comes from the card
>    pipeline's module cards (@mastermind-servex-10). Render the badge from that data when
>    it exists, and leave a 0 or hidden badge until then.
>
> Don't wait on the owner.

## Build

1. **Card size from weight.** `core/Page/weight/weight.js` already computes a page's weight
   (1 + distinct referencing pages + a manual adjustment) from its own `weight.jsonl`/
   `page.jsonl` — reuse it, don't recompute (law 6). `core/Page/weight/page.js`'s own demo
   already has the tiering precedent: `tier = clamp(weight, 1, 3)`, "big" past weight 10.
   For each module card in `/framework/`'s sections:
   - Fetch its weight (async, one call per card, in parallel).
   - A "big" card (weight > 10, or tier 3 — judge against the live numbers, not a guess)
     shows: icon, name, and the first lines of its readme's `## Architecture` section,
     fetched live as text and sliced between that heading and the next `##` — never typed
     out by hand. If a module has no `## Architecture` section, it falls back to the
     current icon+name+description card (nothing to show, not a failure).
   - A small card is icon + name ONLY — no description line, even though one exists.
   - This only touches how a CARD renders inside `home_sections()` — `wall_rungs()` and
     `sprawl()` stay untouched (law 6: reuse the existing section/grid mechanism).

2. **Unread badges.** A small count badge on each module card, and a total on the sidebar's
   own "Framework" link (whatever renders that nav entry today). The real per-module count
   comes from @mastermind-servex-10's card-pipeline work, not built here — coordinate with
   them on the exact data shape (a file? a live endpoint?) before wiring the read. Until
   that data exists, every badge renders 0 or stays hidden — never a guess, never a direct
   recompute from `ext/Inbox`'s own `is_read()` (that's a different, page-local idea of
   "read," not the module-level rollup the owner asked for here).
   Clicking a card with a badge, or the sidebar's rolled-up badge, goes to that module's
   own inbox view, newest first — if a module doesn't have one yet, this can point at the
   module's own page for now and get the deep link once the inbox view exists.

## Scope decision, logged after round-1 review (2026-10-02)

The sidebar's own rolled-up "Framework (N)" total is deferred, not built in this pass: it
needs a new row-template capability in `ux/Tree` (the sidebar's rows have no badge/count
slot today, and `ux/Tree` is a shared, widely-consumed component — "not fixable here"
elsewhere in this codebase, for the same reason). Building it before the real per-module
data exists means designing that API blind. The per-card badge (always 0/hidden until
@mastermind-servex-10's data exists) ships now; the sidebar rollup is a named follow-up for
whenever that data's shape is known.

## Rules

Same as the parent task: a Sonnet task mastermind, at most 1 minion, a pool worktree,
`merge.mjs`, and the review skill at all four widths. Never wait on the owner. Usage pace
is over this week (reuse, don't re-derive); if the badge data isn't ready, ship the sizing
change alone rather than block on it.
