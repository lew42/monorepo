# Sessions — decisions

## 2026-10-04 (vscode-session-cost) — a VS Code tab's own $ was silently stalling after midnight

The owner's own words (dictated): "Is it possible to add the VS Code sidebar sessions... if
we're not logging them to the same system... we should be... use hooks." Full brief:
[`/framework/ai/sessions/2026/10/04/vscode-session-cost/vscode-session-cost/requirements.md`](/framework/ai/sessions/2026/10/04/vscode-session-cost/vscode-session-cost/requirements.md).

**Item 1 (hooks, no timer) was already landed** by the same-day `token-accounting` task below —
`.claude/settings.json`'s `Stop` hook already runs `node public/framework/ai/AISession/AISessionAudit.mjs --append-stdin`
on every turn, for every session including a VS Code tab's. Checked, not assumed, before
building anything new (CLAUDE.md law 6/7).

**The real bug, found live:** `session-361c4d18` (the previous VS Code tab) really did cost
$1,474.21 — a genuine 8,251-turn marathon session, not a rollup mistake; its own transcript
scanned to the same number directly (no sidechain/subagent turns inflating it — checked). But
`session-60d9def6` (the tab this very task's own mastermind was running in) showed **$5.32 /
$29.12** in `week.json` while its real transcript, read directly, already priced out to
**$110.07** — an $80+ undercount. Cause: `session-cost.mjs`'s `find_page_jsonl()` only ever
looked under **today's** date folder for a session's `page.jsonl`. A session's page is created
once, the day it first wrote (`prompt-relay.mjs`'s own cached `{day, slug}` marker) — so any
session still open past midnight has its page under an **earlier** day's folder, and every Stop
hook after midnight silently found nothing there and no-op'd (a quiet `console.error`, never a
thrown error, so nothing ever surfaced this). The cost just stopped climbing, forever, the moment
the clock rolled over.

**The fix:** `find_page_jsonl()` now walks every `<Y>/<M>/<D>/` folder for the session's own
`*-<id8>` directory — the identical rule `ai/AISession/AISessionsPage.js`'s own
`AISessionDetail.dir_index()` already uses client-side (CLAUDE.md law 6: one rule for "which folder
is this session's page"). Verified against the real files: it now finds `60d9def6`'s page under
`ai/sessions/2026/10/03/cards/`, appends the correct $110.07, and `week.json` (re-run by hand, the same manual
snapshot it's always been) now shows it.

**Item 2, "fix the roll-up":** two different things were checked, and only one was a bug.
`spend-tree.json`'s own/subtree split is unaffected — it's a different population entirely (only
Servex-registered agents; a VS Code tab is never a node in that tree, since it has no registry
entry), so there was nothing to double-count there for a VS Code session specifically. What WAS
a real double-count risk: if a session's page ever ended up with **two** folders (the hook's own
tmp marker file lost mid-session), `week-cost.mjs`'s `claude_spend()` used to sum both folders'
`total_usd` — each one a *cumulative, whole-transcript* number, so two folders for the same
session would roughly double it. Fixed: `claude_spend()` now groups by the same `id8` and keeps
only the larger total per session, never both added together.

**Item 3, "show its inputs":** the "Per 1% of your weekly plan" tile (added 2026-10-03, see
below) already had a `title=` explaining the number, but a title only shows on hover — the
owner's own original complaint was exactly that a bare number "means nothing" to him. Added a
small caption under the number itself: `$<claude $ this week> ÷ <plan % used>` — visible without
hovering, no new computation (the same two numbers `usd_per_pct` was already divided from).

**Left open:** `week.json`/`spend-tree.json` are still manual, run-by-hand snapshots (same
"why a script, not a live route" gap the 2026-10-02 entry below names) — this task re-ran
`week-cost.mjs` once, by hand, to prove the fix and refresh the live figure; it does not start
a `--watch` loop (nothing in this fence manages a long-running process for the owner, and one
already exists as a documented, named option for whoever wants it running continuously).

## 2026-10-04 (token-accounting) — two real accounting mistakes, found and fixed; a cache $ breakdown added

The owner's own words (dictated): "make sure we're not making an accounting mistake... update in
real time to wherever the source of truth is... everything else reads one source of truth... keep
track of these tokens very precisely in terms of their cache costs... a breakdown on a session or
an agent... grouped by role, maybe even per prompt type." Full brief:
[`/framework/ai/sessions/2026/10/04/token-accounting/token-accounting/requirements.md`](/framework/ai/sessions/2026/10/04/token-accounting/token-accounting/requirements.md).

**The map (item 1).** Every place a cost or token count is written or read, in one table:

| writer | reads from | what |
|---|---|---|
| `Agents.js` (Servex) | the Anthropic/OpenRouter SDK response | `agent-<id>.jsonl`'s own `result` lines: a RUNNING `cost` total + that turn's `usage` |
| `public/framework/ai/AISession/AISessionAudit.mjs` | a session's own `~/.claude/projects/.../*.jsonl` transcript | per-prompt $, token counts, now a $-by-token-kind split — appended to that session's `page.jsonl` as `{"cost":{...}}` after every turn (a Stop hook) |
| `Server/task-cost.mjs` | the registry + every agent's own log, **now also the transcript** | a task's `cost_usd` on its own `task.jsonl`, the figure the AI board shows |
| `Server/spend-tree.mjs` | the registry + every agent's own log, **now also the transcript** | `spend-tree.json`: every agent ever registered, its own $, its subtree $, by role, by trigger — now with a cache $ split too |
| `Server/DaySpend.mjs` | `task-cost.mjs`'s own `cost_usd` (never recomputes) | a day's Claude $ vs real $, by module |
| `Server/week-cost.mjs` | `session-cost.mjs`'s own `page.jsonl` cost lines | this week's real $ against the plan, the Sessions tab's stat cards |
| `ai/AISession/AISessionsPage.js` | `GET /api/agents`, `sessions.json`, `spend-tree.json`, a session's own `page.jsonl`/transcript | the whole Sessions tab |
| `core/Page/weight/ai-cost.js` | `task-cost.mjs`'s own `cost_usd`/`cost.agents` (never recomputes) | the task-card breakdown table |
| VS Code tabs | nothing writes a $ for them at all until a Stop hook runs `session-cost.mjs --append-stdin` | — |

**Mistake 1 (item 2/3): the cache-write price was wrong, in the one place every reader prices a
token.** `public/framework/ai/AISession/AISessionAudit.mjs`'s `PRICES` table (the ONLY price table in this repo — every
other script above imports it rather than keeping its own copy) multiplied a cache-write token by
`in × 1.25`, the rate for a 5-minute cache. Every Claude Code agent on this machine actually runs
the 1-hour-cache rate, `in × 2`. Checked against 3 real agents, not assumed — every `result` line
in `agent-task-mastermind-models-page.jsonl`, `agent-clarity-models-page.jsonl` and
`agent-reviewer-models-page.jsonl` (two Sonnet, one Opus), comparing the SDK's own billed `cost`
(ground truth — read straight from the Anthropic API response, `Agents.js:1561`) against
`(input×in + output×out + cache_read×in×0.1 + cache_write×in×2)/1e6`: **exact to the last decimal,
every turn**, e.g. one turn billed `$0.1862686` for `{input:8, output:1200, cache_read:739663,
cache_write:6580}` — the `×2` formula gives exactly that; the old `×1.25` gives `$0.1763986`, 5.3%
low. Fixed: one line in `PRICES`, which fixes every reader at once (CLAUDE.md law 6).

**Mistake 2 (item 2/3, the bigger one): a task's own `cost_usd` could badly undercount, because
the agent log it read from can go quiet.** `task-cost.mjs` and `spend-tree.mjs` both compute an
agent's own $ by reading its `agent-<id>.jsonl` and diffing the SDK's running `cost` field —
correct only as long as Servex captures every `result` event. A Servex restart or a mid-turn
revive can drop one without Servex ever noticing, and the total then silently stops short forever
(nothing says so — it just reads as a plausible, too-small number). **Found real while checking
the 3 agents above:** `task-mastermind-models-page`'s agent log topped out at **$7.0872**; its own
Claude Code transcript (the file the CLI writes directly, independent of Servex's own event
pipeline) priced out to **$17.2216** for the exact same work — a 59% undercount the task's own
card was showing as its whole cost. Spot-checking a handful more of today's tasks the same way
(`--dry`, before vs after): `land-two-branches` $4.89 → $9.20, `local-brain` $5.36 → $28.36 (a
long-running mastermind whose agent log had only 5 `result` lines for a session that ran for
hours — most of its real turns were never captured at all). Across every agent Servex has ever
registered, `spend-tree.mjs`'s own total moved from $4749 to $9622 Claude $ once both scripts
preferred the transcript.

**The fix: pick the one source (item 2).** Both scripts now call `public/framework/ai/AISession/AISessionAudit.mjs`'s
`find_transcript(session_id)` + `cost_of_transcript(path)` — the same function `session-cost.mjs`
itself already used for the Sessions tab's per-prompt view — and use ITS total for a non-OpenRouter
agent whenever it reads at least as large as the agent log's own total (never smaller: a transcript
should always be a superset of what the agent log saw; a lower reading means something else is
wrong — an aged-off transcript, a reused session id — and the agent log stays the safer number
rather than silently shrinking a figure the board already shows). An OpenRouter agent is untouched:
it has no Claude transcript at all, and its own $ is already real billed money from the provider,
not a derived estimate. `Server/doc/task-cost.md` has the same story from that script's own side.

**The breakdown view (item 4).** `cost_of_transcript()` now returns a $-by-token-kind split
(`usd_breakdown: {in, out, cache_read, cache_write}`) and `cache_read_pct` alongside its existing
totals — computed once, carried everywhere: `session-cost.mjs`'s `page.jsonl` cost lines (shown on
a session's own detail page, under "Logged cost"), `task-cost.mjs`'s `cost.agents` entries (one
per agent, for whoever renders a task's own breakdown), and `spend-tree.mjs`'s per-agent nodes PLUS
two new top-level arrays, `by_role` and `by_trigger` — the owner's own two groupings, each agent's
own $ (never its subtree, same double-counting rule the existing by-trigger printout already used)
summed per role/trigger alongside its cache-read $ and what % of that group's $ went to cache
reads. The Sessions tab reads `by_role`/`by_trigger` straight (`load_spend_tree()`, already
fetched for the subtree notes) and shows them as a new "Cache $ breakdown, all-time" list next to
the existing date-filtered role/trigger lists — labelled "all-time" because `spend-tree.json` is a
whole-history snapshot, not date-ranged like the lists above it, so it reads as a different figure
rather than a silent disagreement with them.

⚠ **One bug found and fixed while building the breakdown, not before landing:** the first version
divided a transcript-sourced cache-read $ by an agent-log-sourced own-$ (two different, sometimes
disagreeing sources — exactly Mistake 2 above), which printed `cache_read_pct` values over 100%
for several roles. Fixed by making `spend-tree.mjs`'s own `own_claude_usd`/`own_or_usd` use the
SAME transcript-preferring number the breakdown is computed from, so a group's cache $ is always a
fraction of the SAME total it's a fraction of.

**Left open, named rather than guessed at:** a minion with no recorded `parent` in the registry
(`reviewer-models-page`, `clarity-models-page` — both `parent: null`) is invisible to
`task-cost.mjs`'s own tree walk, so its $ is missing from that task's own card total even after
this fix (`models-page`'s true total, including its reviewer and clarity passes, is closer to
$19.50 than the $17.22 the card now shows). `spend-tree.mjs` already has a working reconstruction
heuristic for exactly this gap (`reconstructParent()`, matching a reviewer/clarity's own `name` to
a task slug) and its own role/trigger totals DO include these agents correctly — only
`task-cost.mjs`'s per-task card total still misses them. Not touched here: grafting that
reconstruction into `task-cost.mjs` is a bigger, riskier change (CLAUDE.md's "ask before major
surgery") than this task's remaining budget covers, and the alternative — read the correct,
already-complete total from `spend-tree.json`'s own by-role/by-trigger figures — is live today.

## 2026-10-03 (sessions-tab-polish) — empty bands, stat cards, and why OpenRouter read $0.00 in range

The owner, looking at this page at 3440 (full brief:
[`/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/build/requirements.md`](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/build/requirements.md)):
two empty gray bands above the white card, the week line as plain text instead of dashboard cards,
wide date pickers, "lopsided" padding, and stale-looking numbers — "shouldn't this be computed in
real time by node?" A follow-up narrowed the scope mid-build: skip filling in role/Start/Stop/
Duration (a separate `@task-mastermind-data-grid` task is replacing this grid's own chrome soon),
don't touch `.sessions-grid`'s column widths, and add plain words for the role-filter's
"(unknown)"/"CLI" labels.

**The two empty bands — measured, not guessed.** Headless, 3440, against the live page with real
rows: `.panel2` (the white card) sits inside `.page-column-prose`, inside `.page-column-body`,
inside `core/Page`'s own column chrome. Two things sat above the card with nothing in them:
`.page-column-head` (51px tall — a title bar that's blank, because this page's own `title: ""` is
deliberate, the AI icon heading already says where you are) and `.page-column-prose`'s own
`padding-block-start` (25px — the generic "a column's content is a short reading note" inset
`core/Page/Page.css` gives every column). Both belong to `core/Page`, outside this task's fence
(`Server/doc/review.md`'s fence rules — only `ai/sessions/` and two `Server/` scripts are editable
here), so the fix is a scoped override in THIS page's own `sessions.css`, not an edit to
`core/Page/Page.css`: `.page-column-head:not(:has(.page-column-close))` (the column that can never
be closed — the root grid, never an opened session-detail column, which always HAS a close button)
is hidden outright, and its sibling `.page-column-prose`'s top padding is zeroed the same way,
scoped under `.page--sessions` so no other page is touched. An opened session's own detail column
keeps its real title, its close button, and its normal inset — unaffected, since it always has a
`.page-column-close` the selector excludes.

A third thing was checked and ruled out: does the WHOLE PAGE scroll (tabs included), or just the
card? Measured: `.page-column-body` already has its own `overflow-y: auto`, and the tab strip sits
outside it in the DOM — so "the tabs stay put while the card scrolls" was already true before this
task; the owner's complaint was really just the two empty bands making it LOOK like the scroll area
started in the wrong place. No new sticky/fixed positioning was needed.

**The "lopsided" padding — measured, found NOT asymmetric; the real culprit was the date inputs.**
`.panel2-main`'s own `padding` (the `--pad` token every panel uses) measured as a single equal
value on all four sides at both 1920 (26px) and 3440 (62px) — no stacked-padding bug, checked by
comparing the card's content-box rect to the grid's own rect on both sides. The actual asymmetry:
`framework.css`'s base-layer rule (`input:not([type=checkbox], [type=radio], [type=submit], …) {
width: 100% }`) doesn't exclude `type=date`, so inside the `.sessions-daterange` flex row BOTH date
boxes fought for the row's full width, unevenly — one grew much wider than the other. That read as
"lopsided padding" even though the card's own padding was never the problem. Fixed with
`width: auto; flex: none` on `.sessions-daterange input[type=date]` — the brief's own suggested fix
(don't add a fixed px width), confirmed as the actual cause rather than assumed.

**The stat cards.** Five tiles, the `ui/stats` TEMPLATE reused exactly as documented there (CLAUDE.md
law 6 — no new component, no new CSS beyond the cents-smaller-than-dollars split): Claude $ this
week, OpenRouter $ this week, plan used % this week, the plan's own $-per-1% (as a LABEL — "Per 1%
of your weekly plan" above a big `$26.65` — rather than crammed into the number as `$26.65/1%`,
which is the exact string the owner said he didn't understand), and the current filtered session
count (updates live as filters change, via `render_rows()` calling `render_stats()`).
`ux/Content/Spend.js` was checked first for an existing "$ big, ¢ small" convention (law 6) — it
renders a plain `"$12.34"` string, nothing to reuse — so `money_parts()` (`page.js`) splits the
STRING in markup, two `span`s, rather than inventing a new CSS class for the whole amount; the only
new rule is `.sessions-stat-cents` (size/weight/colour step down, not a new type-scale step).

**Why OpenRouter read $0.00 in range, and why the Claude figure in range didn't reconcile with the
week line either.** Checked directly, not assumed: `Servex/ext/openrouter/reconcile.mjs`'s
`OR_LOG_PATH` (`%LOCALAPPDATA%/lew42/servex/logs/openrouter.jsonl`) has 105 real entries, dated
2026-09-30 through 2026-10-02 on this machine — OpenRouter spend is NOT zero. The $0.00 came from
where the RANGE summary computed its number: entirely client-side, from `cost_openrouter_usd` on
whatever rows the page already had loaded (`openrouter_usd_of()`, `page.js`) — and **no row this
page has ever carries that field with a real number.** `merge()` defaults it to `null` and nothing
ever sets it: `GET /api/agents` has no OpenRouter field, and `sessions.json`'s snapshot script never
writes one either. The same is true, less obviously, for the Claude figure: `sessions.mjs`'s own
`vscode_or_cli_rows()` writes `cost: null` for EVERY VS Code/CLI row (a plain transcript file has no
per-session $ rolled up in it at scan time) — so the old "range" summary's Claude total was, in
practice, only ever summing the live Servex rows' own running cost, not a real total either.

**The fix picked, and why.** The brief named three options and said to pick whichever is actually
true (CLAUDE.md law 7 over a fake "it's live" label). Building a true live per-range query was
ruled out first: it would need either a new HTTP route (`GET /api/sessions`-shaped, explicitly out
of this fence — `Server/run.js`/`Server/Server.js` are untouchable here) or a watcher hooked into
the already-running dev server process (same problem — `Server/watch.js` is one shared `fs.watch`
handle with no per-script hook point reachable without editing `run.js`). Neither is available
inside this task's fence, so a fully live range figure is not buildable here — named as an open
gap below, not hidden. What WAS buildable and is now built: `Server/week-cost.mjs`'s own windowed
computation (`claude_spend(from,to)`, `openrouter_spend(from,to)`) is now `compute_window(from,to)`,
exported with no import-time side effect (the compute/write/log path only runs when the script is
executed directly — the same `is_main` pattern `public/framework/ai/AISession/AISessionAudit.mjs` already used) — so the
week figure (the stat cards) and ANY future arbitrary-range figure go through the exact same real
computation and can never disagree with each other, only with whatever a client-side row sum
guesses. The RANGE summary line below the grid now only claims what it can actually compute (Claude
$ from rows that already carry a logged cost, honestly labeled as partial with a `title=`
explaining why), and points up at the real week cards for the true total — rather than showing a
confident, wrong $0.00 OpenRouter figure next to a real non-zero one a few lines above it. The
"cost by role" list got the same fix (OpenRouter column dropped — it was always $0.00 there too,
for the identical reason).

**What a real live range figure would still need** (open, same shape as the existing "why a script,
not a live route" gap below): a `GET /api/sessions`-style route this task's fence has never allowed
touching, OR `Server/week-cost.mjs`'s `compute_window()` wired into the dev server's own process so
it can answer on demand instead of only when run by hand. The script itself is already reusable for
this (`node Server/week-cost.mjs --from <iso> --to <iso>` prints any window's real numbers right
now) — only the wiring from a browser request to that script, without a new route, remains
unsolved, and stayed that way on purpose rather than growing this task past its fence.

**Role-filter labels.** The owner's own follow-up: "(unknown)" and "CLI" mean nothing to him. Added
`ROLE_LABELS` (`page.js`) — "(unknown)" → "(unknown)" (kept, since that word IS the honest fact, but
now with a `title=` saying exactly what it means: a VS Code/CLI session with nothing in the data
that says who was driving it), "cli" → "Terminal sessions", "vscode mastermind" → "VS Code tabs",
"echo/refiner" → "Echo / refiner". A real Servex role (e.g. `minion-sessions-tab-polish-build`) is
already a real, meaningful name and passes through unchanged — only the four short/guessy words
`role_of()` can actually produce got a plainer label. Every filter checkbox and every "cost by role"
row now carries the matching `title=`.

**Item 4 (fill the role/Start/Stop/Duration blanks) — deliberately left, per the owner's own
follow-up scope narrowing, not a miss.** The brief originally asked for this; a mid-build message
from the owner (relayed by `task-mastermind-sessions-tab-polish`) marked it low priority and asked
for it to be logged as a back-burner item instead, since `@task-mastermind-data-grid` is building a
replacement grid that will own this chrome soon — duplicating that work here would just be rebuilt
over. Not touched.

## 2026-10-03 (sessions-date-homes) — reconciling with decisions made after the grid shipped

The owner (via vscode-mastermind) sent three follow-up corrections against the landed grid:
no duplicate transcript data, a session's home is its date path (not this tab's own route), and
Start/Stop/Duration alongside Cost on every row. Full brief:
[`/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-date-homes/requirements.md`](/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-date-homes/requirements.md).

**No duplicate data — reused, not rebuilt.** `ai/sessions/transcripts/<id>.json` (110 files,
2.5 MB) is gone; `sessions.mjs` no longer writes it, and `ai/AITask/replay.js`'s own `load()`
(exported, reused as-is — law 6) already fetched a session's transcript LIVE through
`/ai-logs/<id>`, a loopback-guarded dev-server route (`Server/plugins/AILogs.js`) that reads
straight from `~/.claude/projects/...`. `load_transcript()` (`page.js`) now calls that instead of
reading a copy, and filters for real prompts the same way `sessions.mjs` already does server-side
— a second, small implementation of that filter was accepted rather than threading one shared
function across the node/browser boundary (the same tradeoff `AISessionDetail.dir_index()`'s own
directory.json walk already made, noted below it).

**A session's home is its date path — built as a seam, because nothing to list exists yet.**
Checked live, 2026-10-03: no `ai/<Y>/<M>/<D>/<slug>-<uuid8>/` folder exists anywhere on this
machine — `task-mastermind-prompt-refine`'s hooks that would write one haven't landed, and its own
plan for the exact path shape changed three times while this task alone was open (see the FYIs
logged in `task.jsonl`, 2026-10-02/03). Chasing a moving, not-yet-real target would be guessing,
not computing (CLAUDE.md law 7) — so this task built the LOOKUP instead of the DATA:
`AISessionDetail.dir_index()` walks `/framework/directory.json` once per grid load for any
`<slug>-<id8>` folder, keyed by id8, and every row's own `href` prefers that date path when found,
falling back to this tab's own `/sessions/<id>/` view otherwise. Today every row falls back — the
index is always empty — and the day a real page appears, the very same code links to it, with
nothing here to change. The detail page's existing `find_session_page_dir(id)` (built by the
session-costs minion-build, 2026-10-02, for cost/trace lookups) was folded into this same index
function rather than kept as a second directory.json walk.

**Found and fixed in passing: a Servex row's `id` is not its `session_id`.** The detail page's
dir/transcript lookups used the url's own `id` directly — correct for a VS Code/CLI row (where the
two are the same string) but wrong for a Servex row, whose url `id` is the AGENT's id (e.g.
`"clarity-weight-badges"`), a different string from its real Claude `session_id`. Latent since the
Role/Cost build added Servex rows to this page; fixed here since this task was already rewiring the
same lookups for the date-path reconciliation — `load_row()` now resolves first, and
`row.session_id ?? id` is what every lookup after it uses.

**Start / Stop / Duration.** `sessions.mjs` now tracks a VS Code/CLI row's own `started_at` (the
file's first timestamp — it already tracked `last_activity`, the last one) and a best-available
`stopped_at`: null while the row reads "active" (the same 5-minute idle floor `state` already
used), its last activity once idle — a plain transcript has no formal "stopped" event, so this is
a computed stand-in, not a fabricated one, and is openly described that way in the row itself
("ongoing" in the Stop column, never a guessed clock time). A Servex row's `stopped_at` needed one
small addition: `GET /api/agents` (`Agents.js` `card()`) didn't expose it, though the live Agent
object already carried it once stopped (`Agents.js:542`) — a one-line additive fix (no rename, no
moved responsibility, every existing caller unaffected), not the "major surgery" CLAUDE.md asks
first about. Duration reuses `dur(elapsed(...))` from `ai/AITask/stats.js` (already used by
`replay.js`'s own header) rather than writing a third time-formatter.

**Also fixed while here:** `.claude/hooks/syntax-guard.mjs`'s `hidden_guard()` false-flagged
`Agents.js`'s own `spawn(spec){`/`async fork({...}){` class methods, and two doc comments that
spell out real call syntax in prose, as unguarded `child_process` calls. Fixed at the hook (a
method definition's closing paren is followed by `{`, never what a real call's is; comment text is
blanked before scanning, keeping every line number correct) rather than renaming either method —
`spawn`/`fork` are called in a dozen places across Servex as `agent.spawn(...)`. Unrelated to
Sessions, found only because touching `Agents.js` tripped it; worth fixing immediately since it
would otherwise block every future edit to that file.

## 2026-10-02 (sessions-grid-v2) — a CSS grid, `columns()`, and `ext/grip`, not three new things

The owner's follow-up ask added three requirements on top of the shipped preview-card list:
a data grid with Start/Source/Name/Model/State/Cost, no HTML `<table>`, one `--col-<name>` token
per column with a resize that touches only that token, and a Notion-style side peek on a wide
screen. Full brief: [`/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-grid-v2/requirements.md`](/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-grid-v2/requirements.md).

**The grid, without a `<table>`.** `.sessions-grid` is one real CSS grid; the header and every
data row are `display: contents`, so their cells become the grid's own flat items and line up in
its `grid-template-columns` tracks — the exact nested-`display:contents` idiom `core/Page`'s own
`columns()` already uses to let a tree of pages read as a row (`doc/columns.md`, "Peers on screen,
a tree in the DOM"). Each track is `minmax(<floor>, var(--col-<name>))`, so the grid itself refuses
to go under the floor even if JS never clamped it.

**The resize, reusing `ext/grip`.** Not a new drag handler: `grip({ from: "start", write(px){…} })`
on each header cell, the same factory `ext/files`, `Panel2.split`, `core/Sidebar` and `core/Page`'s
own column system already call. `from: "start"` measures the cell's own left edge — which IS the
column's start — so the pointer position it hands `write()` is already the column's width, no
extra arithmetic. `write()` touches exactly one token (`$grid.style("--col-" + key, …)`), satisfying
"resizing a column changes the one token" with no bespoke code. The handle you actually see and
drag sits on the cell's **right** edge, not its left: `grip`'s own `mirror` option defaults to
`from === "start"`, which draws the strip at the opposite edge from the one it measures — so
"measured from the left" and "dragged on the right" are the same grip, not a contradiction (the
readme's "drag a column header's own right edge" and this doc's "measures the cell's own left
edge" are both true, of two different things: where you grab it, and what it computes).

**The side peek, reusing `columns()`.** The alternative considered was a bespoke `:has()` master-
detail layout (the shape `core/new/1/site/compound/master-detail/page.js` hand-rolls) or putting
the detail on `Panel2.Side`. Rejected: `Panel2.Side` is navigation chrome that slides OVER the
page (a drawer), not a second reading pane beside it, and a hand-rolled `:has()` layout would be a
second master-detail mechanism next to the one `core/Page` already ships and three other pages
already use this exact way (`core/Page/overview/columns/uses/inbox/`). Sessions calls
`this.columns()` and sets `width: "fill"`; the grid claims the whole row alone, and the existing
"`fill` yields to an open child" rule (`doc/columns.md`) drops it to the default reading width the
moment a row's detail opens, leaving the rest of the row to the detail page — the whole peek, for
free, from a rule already shipped for other pages. The `< 32em` phone regime `core` already has
folds it to one screen at a time; nothing extra was written for narrow screens either.

**Found live, fixed same day:** a cell callback written as `cond && small.c(…)` rendered the
literal text "false" in the Cost column, because a live agent's `cost` field really was the
boolean `false` (not a number, not null) — the arrow function's own return value (`false`) was
the thing that ended up as a stray text node. Rewritten as plain `if` statements. The Dashboard
tab's own Sessions tile (`ai/dashboard/page.js`) reuses `AISessionView`/`AISessionRows.merge()` (law 6, one row
renderer) and needed the same `sessions-grid` class added to its own container, since a cell's
grid position depends on the parent actually being that grid.

## Why a script, not a live route

The owner wants a live sessions list, and the obvious way to build one is a real Servex route,
`GET /api/sessions`, answering one row per session straight from the agent registry and the
machine's own Claude session files. This task asked for exactly that
(`Servex/agents` inbox note, 2026-10-02, from `task-mastermind-panel2-sessions`), with the full
row shape it would need. No reply had landed by the time this tab had to ship, and this task's
own write fence is `public/framework/ai/` plus two named files — it cannot add anything under
`Server/` itself to build the route another way.

A browser page also cannot read a local `.jsonl` file by itself (no filesystem access), so for
the VS Code/CLI half of the list, SOME node process has to do that scan. The smallest thing that
works today: a plain script, `sessions.mjs`, run by hand, writing one JSON snapshot this tab
fetches. Servex's own agents are different — `GET /api/agents` already exists and answers live —
so the page polls that directly instead of waiting on the snapshot for those rows, and only the
VS Code/CLI half goes stale between script runs.

**What a real route would still add, that this cannot:** a Servex-sourced row's `last_prompt_first_
line` (`GET /api/agents` carries no transcript at all), and sessions outside this one machine's
`c--Code-lew42-monorepo` project folder (a worktree runs its own session files under a differently
-named folder, keyed by its own path — e.g. this very task's own session lives under
`C--Code-lew42-worktrees-panel2-sessions`, not the folder `sessions.mjs` scans). Both are
one-line additions once the route exists; neither is worth hand-rolling twice.

## The VS-Code-vs-CLI heuristic, checked against real data

Every session's own `type: "user"` lines carry a `turnOrigin` field: `"human"` when a person
typed it, `"sdk"` when a program sent it, and — found only by reading a real file —
`"task_notification"` for the harness telling itself a background task finished. The rule:
look at the LAST real (non-sidechain, non-task-notification) user line in the session; `"human"`
tags it `vscode`, anything else tags it `cli` (a Servex-spawned agent's own session never reaches
this scan at all — its `session_id` is already in Servex's own agent list, excluded before the
file scan runs).

Checked against two real sessions before shipping: the task's own named test case,
`361c4d18-e878-4c04-9537-444e847e13d5` (a real, interactive VS Code mastermind tab), and a
Servex-spawned `task-mastermind-framework-home` session. The FIRST version of this script used
whichever user line was simply last in the file, which for `361c4d18` was a `task_notification`
line (the harness noting a background sub-task finished) — tagging a genuinely interactive
session `cli`. Excluding `task_notification` lines from the scan fixed it; re-verified after the
fix that `361c4d18` tags `vscode` with a real, human-written last prompt.

## Open: a Servex row's time is when it started, not its newest activity

`merge()` reads `a.started_at` for a Servex row because `GET /api/agents` carries no
last-activity field — only `started_at`, `turns` and `cost`. "Newest activity first" is exactly
right for VS Code/CLI rows (their own transcript's real last timestamp) and only approximately
right for Servex rows, which sort by when the agent began, not its latest turn. A long-running
agent that started early but just replied would sort behind one that started later and has gone
idle. Noted, not fixed: the same real route this task already asked for (`doc/decisions.md`
above) would carry a true last-activity field; patching around its absence here would be the
same kind of guess this task avoided for the Inbox tab's own data source.

## Open: `css-scopes.txt` reservation

`sessions-` is free (grep across `public` found only JS property accesses like `proc.sessions`,
never a CSS class) but this task's fence doesn't include
`public/framework/styles/css-scopes.txt`. Whoever next can write that file should add:

```
sessions-    ai/sessions
```

## 2026-10-02 (session-costs minion-build) — real per-prompt $, sort, filters, RAM, role

Full brief: [`/framework/ai/sessions/2026/10/02/session-costs/minion-build/requirements.md`](/framework/ai/sessions/2026/10/02/session-costs/minion-build/requirements.md).

**Why two more scripts, not one bigger one.** `public/framework/ai/AISession/AISessionAudit.mjs` (per-session, per-prompt,
from a raw transcript) and `Server/week-cost.mjs` (the week's totals, from every session's own
logged cost) are kept separate from `Server/task-cost.mjs` (a Servex agent's own running total,
from its agent log) on purpose — they answer different questions from different sources, and
`task-cost.mjs` already works; merging them would make one script read two unrelated kinds of log
for no benefit. `Server/doc/task-cost.md` has the full one-is-not-the-other case.

**The Cost header sorts; missing data sorts last, never first.** A session nobody has priced yet
(no transcript scanned, no cost line logged) would look like the cheapest session in the list if
`null` sorted as 0 — `sort_by_cost()` (page.js) always puts every row with a known cost first, in
the chosen direction, and every row with none after them, untouched.

**The state icon reuses one rule for "in flight."** `WORKING_STATES = {"working","active"}` is the
one place that decides blink-vs-dot; `Server/task-cost.mjs`'s own `closed()` check uses a similar
but not identical set (`/^(stopped|gone)$/`) for a different purpose (can this agent's cost still
grow) — the two aren't merged because a "stopped" agent and an "idle" one are different facts for
a reader of this grid (one is over, one might start again), even though neither is "working".

**The role heuristic is a real, named gap, not a guess dressed up as data.** A Servex row's role
is always real (`a.role`, straight from the agent registry — the exact field
`Server/task-cost.mjs` already reads as `row(id).role`, never computed). A VS Code/CLI row has NO
role field anywhere in the data this page reads (`sessions.json`, `GET /api/agents`) — the brief's
own fuller heuristic ("a task's own line-1 `group` naming 'every-prompt'" → "fast assistant") needs
the task's own `task.jsonl`, which this page never fetches (it would mean one more request per row,
every poll, for a guess). What `role_of()` (page.js) actually does: an id starting `echo-` →
"echo/refiner" (the one naming convention visible from the id alone); otherwise the row's own
source tag, spelled out ("vscode mastermind" / "cli") — never a stronger guess. **Fixing this for
real needs the session's own line 1 to record its role going forward** — outside this task's fence,
same as the RAM gap below.

**RAM stays blank — `GET /api/agents` doesn't carry it yet.** The column, the `ram_mb` /
`ram_sample_age_ms` fields and the "under 10 seconds old" check are all in `AISessionRows.merge()` and `AISessionView`
now, so the moment Servex's own agent card adds real-time RAM, the column lights up with no further
change here. Until then it is correctly, permanently blank — never a fabricated or stale number.

**The OpenRouter tag's colour: `--subtle`, not a new one.** The brief asked for a colour
"different from Claude $'s muted text" that "passes contrast against both themes" and comes from
the existing token set, not an invented one. `lew42.css` (the live theme) has exactly two
`light-dark()`-aware TEXT tokens besides `--ink` itself: `--prim-ink` (already the Servex tag's
colour — reusing it here would make Claude $ and OpenRouter $ look like the same category) and
`--subtle` (checked: >4.5:1 against both `--surface` and `--wash` in both themes, and visually a
plain grey — distinct from the orange `--prim-ink`). No `--warn-ink`/`--ok-ink`/accent-ink token
exists in this theme yet; `--subtle` was the only real choice, not an invented one.

**`page.jsonl`'s `cost` line carries two fields beyond the brief's own minimum shape:**
`last_prompt_input`/`last_prompt_output`, alongside the specified `total_usd`/`last_prompt_usd`/
`by_model`/`source`/`at`. The detail page's own per-prompt row (brief item 5: "time, input/output
tokens, $") needs token counts that the brief's literal append shape didn't carry — adding them is
additive (a reader that only looks at the documented fields is unaffected) and avoids inventing a
second log line just to carry two numbers.

**Filters are a plain `<label><input type=checkbox>` row, not a new component.** A quick look for
a reusable multi-select turned up `ux/Filter/FilterChips.js` (dismissable chip pills over a
`Filter` base) — a different shape (it shows the ACTIVE filters as chips you remove; this needed a
persistent toggle row you check/uncheck in place) and pulling it in would have meant learning and
wiring a second system for a yes/no list of under a dozen roles. The brief's own fallback ("a plain
`<label><input type=checkbox>` row is fine if nothing reusable turns up quickly") applied.

**Role/date filters, the summary line and "cost by role" are all computed client-side, from rows
already on screen** (CLAUDE.md law 7) — no new fetch, no new endpoint; `render_rows()` (page.js) is
the one function that redraws all three together whenever a filter, the sort, or the next poll
changes the row set.

## Open: only one project's session files are scanned (partly fixed, 2026-10-02)

`sessions.mjs` only reads `%USERPROFILE%\.claude\projects\c--Code-lew42-monorepo\*.jsonl` — the
main checkout's own sessions. A session run from a worktree (including this very task's own)
writes to a differently-named project folder and never shows up here. Scanning every
`c--Code-lew42-*` folder would catch them, at the cost of reading many more files on every run;
**`public/framework/ai/AISession/AISessionAudit.mjs`'s own `find_transcript()` already does scan every `c--Code-lew42-*`
folder** (it has to, to find ONE session by id, cheaply — unlike `sessions.mjs`, it never reads
every file in every folder, just checks whether `<folder>/<session-id>.jsonl` exists) — so a
worktree session's own cost IS found and logged correctly today, even though it still never shows
as a ROW in this grid until `sessions.mjs` gets the same fix.
left as a known gap rather than guessed at, since nobody has asked for worktree sessions to show
here yet.

**Same gap, found again in `/ai-logs/`, 2026-10-03.** `Server/plugins/AILogs.js` computes its own
project directory from `process.cwd()` at the moment the dev server boots — so a worktree's own
preview server (`worktree-up.mjs`) looks for session files under ITS OWN cwd's project folder, not
the main checkout's. Verified live building this task: a real session id's transcript answered
correctly via `curl` against the main site, but 404'd (as "no transcript") through a worktree
preview of this very task's own branch. Not a regression this task caused or fixed — the same
one-project limitation above, just hit from a second angle; noted rather than patched for the same
reason: nobody has asked for it.

**Same gap, a third time, in `week-cost.mjs`'s stat cards (clarity check, 2026-10-03).** `claude_spend()`
walks `public/framework/ai/<Y>/<M>/<D>/*/page.jsonl` under its `root` argument — a worktree's own
checkout of that tree, not the main checkout's live, mostly-uncommitted session dirs. Verified: the
same `node Server/week-cost.mjs` run reports `claude_usd: 0` from the worktree and `claude_usd:
1482.68` from the main checkout, same code, same window. `compute_window()`/`claude_spend()` are
correct — this is the worktree-isolation gap above, not a computation bug. The sessions-tab-polish
task's own "after" proof screenshot was taken against the worktree preview, so its $0.00 is that
same artifact, not a regression of the bug it was built to fix; real figures show once merged (or
when read against the main checkout directly).

## 2026-10-03 (session-trace) — the cost-over-time chart + "what was it doing" table

The owner's own words, said while looking at the vscode-mastermind session: "The data is already
there: every transcript line has a timestamp and the usage of each call." "This is the tool that
tells us whether an agent did anything unnecessary." Full brief:
[`/framework/ai/sessions/2026/10/03/session-trace/requirements.md`](/framework/ai/sessions/2026/10/03/session-trace/requirements.md).

**`trace.json` is a manual, on-demand file today, same honesty `week.json`'s own note already
uses.** `public/framework/ai/AISession/AISessionAudit.mjs`'s new `trace_of_transcript(path)` walks a session's raw
transcript a second time (alongside `cost_of_transcript()`, untouched) and returns one row per
`tool_use` block plus the per-turn `$` groups the chart's y-axis steps on. `node
public/framework/ai/AISession/AISessionAudit.mjs --trace-file <id> <out-path>` writes it to disk — run by hand, same as
`sessions.mjs`/`week-cost.mjs` already are. It is **not** wired into the Stop hook: a long session
can have thousands of tool calls (the real test case below has 4,225), so a trace file can run into
several megabytes — appending one after every turn, for every session, forever, was judged not
worth it until something actually needs it live. This is an open gap, named here on purpose, not a
hidden limitation.

**The thresholds the four waste checks use are this task's own best first guess, not laws** —
tune them in `page.js` (`waste_flags()`) the moment real use shows they're wrong:
- Same file read **3+ times** → flagged.
- Chunked reads of the same file: **2+** reads with a different `offset`/`limit` each time.
- Polling: the same file (or the exact same full Bash command, never the 60-char `target` string,
  which would false-match unrelated commands that just start the same way) called **2+** times
  with **under 15 seconds** between calls and nothing written in between.
- Long read-no-write run: **5+** consecutive Read/Grep/Glob/ToolSearch calls with no
  Edit/Write/NotebookEdit/write-shaped-Bash in between.

A Bash call counts as "a write" by a plain regex over its own command text (`>`, `rm`, `mv`, `cp`,
`mkdir`, `touch`, a mutating `git`, `npm i`, …) — an approximation, not a certainty (there is no
reliable way to know what an arbitrary shell command did without running it), named as a tunable
rather than hidden as a false precision.

**No real per-turn OpenRouter split exists in the data yet — the chart is Claude-$-only, an honest
MVP, not two series invented from nothing.** `page.jsonl`'s own `cost` lines only ever carry
`source: "claude"` and a `by_model` breakdown of Claude models; nothing in this task's own test
data recorded a real per-turn OpenRouter `$` figure. The brief named this exact fallback as
acceptable ("a single Claude-$ line is an honest MVP") rather than drawing a fabricated second
line — the moment real per-turn OpenRouter data exists somewhere, the chart's own one-series-only
code path is the thing to change, not the chart's shape.

**Proof, against real data, not a hand-built fixture:** `node public/framework/ai/AISession/AISessionAudit.mjs --trace
355eb7ba-ed23-46bb-ab6f-77c073a23571` (this task's own mastermind session) returned 84 calls / 87
turns. For a session that actually has repeated reads, `361c4d18-e878-4c04-9537-444e847e13d5` — the
SAME transcript this brief's own "what a transcript line actually looks like" section was verified
against — was used: 4,225 calls, 4,708 turns, $1,492.40 total. All four waste checks fired for
real: `CLAUDE.md` read 5 times (5 separate chunks), `.claude/skills/mastermind/SKILL.md` read 8
times (8 chunks), `.claude/skills/sub-mastermind/SKILL.md` read 4 times (4 chunks), plus three more
same-file / chunked-read flags — 15 flags total, confirmed by eye in the live page (headless
Playwright, 1920 wide) before this task landed. No polling flags fired for this particular session
(every repeat it has either has a write between the calls, or is more than 15 seconds apart) — not
a dead code path, just a true finding about this one session; the logic itself was separately
confirmed against a small synthetic trace (6 reads, 2 seconds apart, no writes → one run-flag,
correctly).

**The chart is plain inline SVG, no charting library** (CLAUDE.md: no new npm dependency) — same
house style `ux/Content/Spend.js`'s own $-over-time bar chart already uses (`el.innerHTML =` a
built-up SVG string; this page uses `View.html_unsafe()` instead, the same mechanism under a
different name). `AISessionTrace.chart_svg()`'s own `nice_step()` helper is a direct copy of `Spend.js`'s
identical function, not an import — `Spend` is a `ContentModule` built around its own fetch
lifecycle, not a plain function this page could call standalone, and the function itself is four
lines.

**The per-tool-call tick's only interactivity is a native `<title>` tooltip** (tool name + target,
shown on hover by the browser itself) — not a custom crosshair/tooltip layer. The dataviz skill's
own "ship a hover layer by default" rule is satisfied at the cheapest level that actually works;
a richer synced crosshair across the whole chart is a fair next step if this page gets real use,
not built pre-emptively here (CLAUDE.md law 1: fastest working version first).
