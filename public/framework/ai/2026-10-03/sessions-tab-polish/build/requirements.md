# AI Sessions tab: cost cards up top, no empty bands, numbers that are always current

Load the `minion` skill first. Your task dir (log here; it already has line 1):
`public/framework/ai/2026-10-03/sessions-tab-polish/build/`

Work in the worktree: `C:\Code\lew42\worktrees\sessions-tab-polish` (branch
`worktree/sessions-tab-polish`, its own dev server at `http://sessions-tab-polish.localhost/`
and `http://localhost:60008/`). Commit there as you go. Do NOT touch the main checkout
(`C:\Code\lew42\monorepo`).

## The owner's own words (2026-10-03, ~5:30pm, looking at /framework/ai/sessions/ at 3440)
> There are three bands of space, and the scroll area starts way above the data grid. The white
> card with the data grid is very clean, I really like it, and it lines up with the AI icon in the
> heading. But two faint gray lines between the top tabs and the white card could just disappear.
> The money: make the dollar sign and value big and bold, formatted correctly; maybe the cents
> smaller than the dollars; put them on their own little dashboard cards, a horizontal preview rail
> across the top, instead of one line of plain text. I'm not sure what "$26.65/1%" means.
> The padding on the card is quite big (our percentage padding at maximum at 3000+ px?) and looks
> lopsided. The date pickers are so wide and don't need to be. "1874 sessions shown" and the Claude
> / OpenRouter spend seem stale: shouldn't this be computed in real time by node, so whenever
> something new runs the sessions data updates and the page adds up real-time data? This shouldn't
> be stale data.

## Read first
- `public/framework/ai/sessions/page.js`, `sessions.css`, `readme.md`, `doc/decisions.md` — the
  whole system: live Servex rows (`GET /api/agents`, polled every 20s), a `sessions.json` snapshot
  (`ai/2026-10-02/panel2-sessions/sessions.mjs`), `week.json` (`Server/week-cost.mjs`, a manual
  snapshot), and per-session cost lines in each session's own `page.jsonl`
  (`Server/session-cost.mjs`, appended by the Stop hook).
- `public/framework/ui/stats/page.js` — the stat-tile TEMPLATE already on this site (not a
  component function — a markup pattern): `div.c("grid gap auto", …)` of
  `div.c("surface pad flex v gap", () => { div.c("h4 muted", label); div.c("h2", value); })`,
  `--column` retuned for tile width. Use THIS pattern for the new cost cards — CLAUDE.md law 6, and
  the owner's own brief line "use or extend an existing stat/pill component... rather than new
  CSS." Also skim `public/framework/ui/badge/` (tones available) in case a pill fits a smaller
  figure better than a full tile.
- Prior sessions tasks' logs, for what NOT to redo or break: `public/framework/ai/2026-10-02/session-costs/task.jsonl` and
  `public/framework/ai/2026-10-03/sessions-date-homes/task.jsonl` (its `review/report.md` already
  found and fixed several of these exact rough edges once — Stop/Duration honesty, the 1200px
  column clip, etc. Don't regress those fixes).
- `public/framework/ext/panel2/panel2.css` — `.panel2-header`/`.panel2-main` chrome. The "empty
  gray bands" and "lopsided padding" live somewhere in this chrome plus whatever wraps the Page
  itself (the Page's own content padding, the tab strip above it) — load the page at 3440 in a
  headless shot and look at the DOM, don't guess from the CSS alone.
- `Server/week-cost.mjs` and `Server/session-cost.mjs` — the two cost scripts. `Server/task-cost.mjs`
  is a DIFFERENT system (per-agent, not per-session) — don't touch it, don't merge the two.

## ⚠ SCOPE NARROWED (owner follow-up, 2026-10-03, via vscode-mastermind) — read before continuing
1. **Item 4 (fill the blanks — role/Start/Stop/Duration) is now LOW PRIORITY.** Skip it unless it's
   a genuine one-liner. If you've already built it, keep it; if not, log it as a back-burner item
   on the card instead of spending more time there.
2. **Do NOT restyle the grid itself** — no column-width/resize-grip changes to `.sessions-grid`.
   A reusable data grid is being built separately (`@task-mastermind-data-grid`) and will replace
   this one; don't duplicate that work or fight it later in a merge.
3. **Keep to:** the empty bands (item 1), the stat cards (item 2), compact date pickers (part of
   item 5 — card-padding-lopsidedness still matters too, just not via the grid), and making the
   numbers right and current (item 3) — ABOVE ALL, pin down why OpenRouter reads $0.00 in range.
4. **New — filter labels.** "(unknown)" and "CLI" mean nothing to the owner. Give the role-filter
   checkboxes and any place these words show plain names (e.g. "Servex agents" for a servex role,
   "Terminal sessions" for CLI) or, if a short label would lose information, keep the short word
   but add a `title=` attribute spelling out what it actually contains (which ids/sources count as
   "(unknown)").

## Do, in this order

**1. Remove the empty bands.** Screenshot `/framework/ai/sessions/` at 1920 and 3440 first (before
any edit) — `node Server/layout-check.mjs http://sessions-tab-polish.localhost/framework/ai/sessions/ --widths 1200,1920,3440`
— and look at the bands in the shot: which element's margin/padding/border is making them. The
page should scroll from the white card; the tabs stay put (sticky/fixed, whichever this page
already uses elsewhere — check how other tabs under `/framework/ai/` handle this, don't invent a
second mechanism).

**2. A row of small stat cards across the top**, using the `ui/stats` tile pattern above (not new
CSS — reuse `grid gap auto` + `surface pad flex v gap` + `h4 muted` / `h2`):
   - Claude $ this week
   - OpenRouter $ this week
   - plan used % (this week)
   - cost per 1% of the weekly plan — SPELL IT OUT, e.g. "$26.65 per 1% of your weekly plan" (not
     "$26.65/1%" — the owner said plainly he didn't know what that meant)
   - sessions shown (the current filtered count)
   Big bold dollars, smaller cents: look at how `h2`/`h4` render a `$X.YZ` string today — if there's
   no existing "$ big, ¢ small" convention on the site, split the string in markup (two `span`s,
   one bigger) rather than inventing a new CSS class; check `ux/Content/Spend.js` first (law 6) —
   it already renders $ amounts and may already have this split.

**3. One source of truth, current — every figure computed by the server from the transcripts and
usage files, recomputed when a session file changes, not a stale hand-run snapshot.** This is the
real engineering piece. The current week line reads a snapshot (`week.json`,
`Server/week-cost.mjs`, "re-run it by hand to refresh") and the range summary is computed
CLIENT-SIDE from whatever rows already loaded (`page.js`'s `render_rows()`), which is why the two
don't reconcile and why OpenRouter reads $0.00 in range (no row the client has carries a per-session
OpenRouter $ — only the week.json snapshot sums the real OR ledger).
   - Generalize `Server/week-cost.mjs`'s own windowed computation (`claude_spend(from, to)`,
     `openrouter_spend(from, to)`) into a reusable function in `Server/session-cost.mjs` (or a
     small new export `Server/week-cost.mjs` itself exposes) that takes an arbitrary `{from, to}`
     window, not just "this week" — so the SAME function can answer both the week figure and
     the date-range figure, and they can never disagree again.
   - Make it ACTUALLY LIVE, not a second manual snapshot: `Server/week-cost.mjs` should watch for
     change (the simplest honest version: re-run its own computation on every invocation — it's
     already fast, a few hundred file reads — and the page re-fetches `week.json` on every 20s poll
     it already does; OR, if you find the dev server already has a chokidar watcher for `public/`
     changes you can hook a "recompute week.json + sessions.json" into, use that instead of a new
     mechanism — check `Server/watch.js`). You are NOT adding a new HTTP route or editing
     `Server/run.js`/`Server/Server.js` (those are out of this task's fence) — the fence is
     `Server/session-cost.mjs` (and `week-cost.mjs`, its closest sibling, same system) plus the
     files `sessions.mjs`/`page.js` already read. If after checking `Server/watch.js` there's truly
     no way to trigger a server-side recompute on file change without touching `run.js`, the
     fallback (document this as the decision, in doc/decisions.md) is: run `week-cost.mjs` and
     `sessions.mjs` from a small script a `node Server/sessions-refresh.mjs` wraps, and have it
     re-run the two scripts itself on a short interval via `setInterval` IF started — but do NOT
     start a new always-on background process as part of landing this task (the never-list: no
     process left running after your turn ends). Prefer the honest, simple fix: make the RANGE
     figure (not just the week figure) come from the SAME real computation
     (`week-cost.mjs`'s generalized function) instead of summing client-side rows that don't carry
     OpenRouter $ — call it with the picked date range instead of "this week", from a small script
     invoked the same way `sessions.mjs` already is (re-run by hand / on activation), OR — simplest
     of all — have `page.js` just use the SAME `week.json` figure as both the week line and (when
     the date range IS "last 7 days", the common case) the range line, and otherwise honestly label
     the range figure "Claude $ in range (partial — sessions with a logged cost)" rather than
     silently implying it's complete. Pick the approach that is actually true and say which you
     picked and why in `doc/decisions.md` — CLAUDE.md law 7 (compute, don't recall) over a fake
     "it's live" label.
   - Find out WHY OpenRouter is $0.00 in range specifically (not just "the client doesn't have it")
     — read `Servex/ext/openrouter/reconcile.mjs`'s `OR_LOG_PATH` and confirm whether it has any
     entries in the selected date range at all, or whether the range computation just never reads
     it. Say which, in doc/decisions.md.

**4. Fill the blanks.**
   - Role: for a "(unknown)" row, look at what's actually in a VS Code/CLI row's data
     (`sessions.json`) — the tab/working-folder name, or the session's own first logged agent id —
     and see if a better heuristic than `role_of()`'s current one (echo- prefix only) can derive a
     real role for more of them. If genuinely nothing in the data can tell "(unknown)" apart from
     "mastermind" vs "minion", say so in doc/decisions.md rather than guessing.
   - Start/Stop/Duration: `sessions.mjs` (a DIFFERENT task's file, `ai/2026-10-02/panel2-sessions/`
     — you may read it but coordinate before editing it; if it needs a change, note it in
     doc/decisions.md and make the smallest page.js-side fix instead) should already derive
     `started_at` from a transcript's first timestamp. Check WHY so many rows still show "—": is
     `sessions.json` stale (re-run `node public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs`
     in the worktree and see if the count of "—" rows drops), or is the derivation itself missing
     cases? Fix what's in your fence; name what isn't.

**5. Compact controls.**
   - Date `<input type=date>` sized to its content, not stretched full width — a date input has a
     natural intrinsic size; find what's stretching it (a `flex: 1` or `width: 100%` somewhere in
     `sessions.css` or a parent) and remove that, don't add a fixed px width.
   - Card padding: use the SAME `--pad` token every other panel uses (law 6 — don't invent a
     smaller one), but check it's applied EQUALLY on both inline sides at 1920 and 3440 — the
     "lopsided" complaint is likely a stacked-padding bug (two ancestors each adding their own
     padding on one side only), the kind this skill's own CLAUDE.md names as a common trap. Shoot
     both widths, measure the gap left vs right in the screenshot, fix the real cause.

**6. Screenshots.** Before you start: 1200/1920/3440 of `/framework/ai/sessions/` as it stands.
After you land your changes: the same three widths, same page, same way the owner reaches it (the
rail, not a direct URL paste — though for this headless proof direct URL is fine, just land on the
real tab). If a post-review fix changes anything visible, shoot that too (sub-mastermind skill
rule: a fix made after review gets its own screenshot).

## Fence
`public/framework/ai/sessions/` (page.js, sessions.css, readme.md, doc/), `Server/session-cost.mjs`,
`Server/week-cost.mjs`, this task dir (`public/framework/ai/2026-10-03/sessions-tab-polish/build/`).
Read-only elsewhere (`sessions.mjs`, `Server/run.js`, `Server/watch.js`, `ux/Content/Spend.js`,
`ui/stats/`, `ui/badge/`) — note anything that needs a change outside this fence in
doc/decisions.md rather than editing it.

NEVER the `mcp__playwright` tools — use `node Server/layout-check.mjs` or a headless probe script
of your own under the task's scratch dir.

Model: Sonnet. Keep this to one pass — this is the whole build, not a split; commit in the worktree
as each of the 6 items above lands, so a crash doesn't lose finished work. When all 6 are done
(or honestly declined with why), stop and report back — don't merge yourself, don't run
Servex/sustain.mjs, don't return the worktree.
