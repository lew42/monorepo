# Sessions list: one slim sticky header (step 1 of 3)

Budget: $6. Load the `minion` skill first. Sonnet, medium effort.

The owner's words and all five passes: [../requirements.md](../requirements.md) (read "The owner's ask" and "The owner again" only; the detail page and the cards are later steps, not yours). Record: write your `log` lines in `session.jsonl` in THIS folder through `node .claude/hooks/append.mjs`.

## What to build

On `/framework/ai/sessions/` the controls take ~80% of a phone's first screen. Replace them with **one full-width sticky header with an opaque background** (`var(--surface)` or the page's own background token; cards must not show through), above the card stack, then the list straight away.

The header, one row:
- **"Today ▾"**: one button with a dropdown of ranges: Today · Yesterday · Last 7 days · This month · Custom… (Custom shows the two existing date inputs). It sets `this.date_from` / `this.date_to` and calls the existing `set_from` / `render_rows`. Default stays what the page uses today unless that's more than one day; then default to Today.
- **search**: the existing `.sessions-search` input, narrower.
- **"Filters ▾"**: a dropdown holding EVERYTHING else that `render_controls()` and `render_stats()` draw today (show closed, needs attention + red-flag counts, in flight, the routine-kind chips `$kinds`, the role chips `$by_role`, the summary, the cache breakdown, the usage rail, the counts lines and "show 30 more days"). Move them, don't rewrite them: they must still work. A small count badge on the button when any filter is not the default is nice, not required.
- One muted line of totals may stay in the header ("12 sessions · $34.10") if it fits on a 390 px phone without wrapping; otherwise it goes in the Filters menu.

No second heading on the page: the highlighted Sessions tab already says where you are. If the page draws its own "Sessions" title, remove it.

Code: `public/framework/ai/AISession/AISessionsPage.js` (`render_controls` ~line 260, `render_stats`/`render_counts` ~236, `nav_view` ~161) and `public/framework/ai/sessions/sessions.css` (it already has sticky-header notes at lines 47 and 100; read them: any ancestor that clips becomes the sticky scroller). If the site has an existing dropdown/popover/menu component, use it (look in `public/framework/ui/` and the `ui` skill; the popover system exists); don't build a second one. Load the `css`, `layout` and `ui` skills before the CSS.

Backup, as the owner asked: add `public/framework/ai/sessions/v/classic/page.js` that renders the page with today's old controls (a constructor option like `{ classic: true }` that keeps the old `render_controls` path is fine; do not copy the 650-line file), and link it from the Filters menu as "Old layout". `AISessionsPage.route()` already passes `v/<name>/` through.

Check there is another sticky bar above (the site's top tabs): the header's `top` must sit under it, not behind it.

## Where

Worktree: `node Server/worktree-up.mjs sessions-header` (never plain `git worktree add`); work and load the page there. Commit at every working step on that branch. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.

## Done means

- Headless shots (Playwright, `file:///C:/…` imports; scratch scripts in your session scratchpad, not the repo) at **390 and 1920, unscrolled and scrolled ~600 px**, saved in this folder as `shot-390.png`, `shot-390-scrolled.png`, `shot-1920.png`, `shot-1920-scrolled.png`, plus one `before-390.png` from the main site first. In the 390 shot the first session card's top is within the first ~180 px under the site's tabs. Measure it and log the number.
- Every moved control still works: toggle "show closed" and one role chip in a headless run and log the row count before/after (two numbers that must differ).
- `node Server/smoke.mjs` on the page: no FAIL. `node --check` on every edited JS file.
- Committed on the worktree branch; the readme `public/framework/ai/sessions/readme.md` "How data is read" line about the page says one sticky header + Filters menu + v/classic (one sentence).
- Last: a `log` line with the branch name, the measurement, and the shot paths. Do NOT merge; the mastermind reviews and merges.

Deliverable size: the shots and one log line. Cut first: the count badge, the totals line.
