# AI reporting — what's logged, what's broken, what to build

## 1. Every stream logged today

| stream | writer | path | consumed by | rendered where |
| --- | --- | --- | --- | --- |
| `task.jsonl` — `assign log action agent chat shot` | new-task + finish-task skills (hand); `ledger.mjs` (first-touch `action`, `log: skill:`, resume/end) | `ai/<date>/<slug>/` × **139** | `TaskJSONL` | card + task page |
| `day.jsonl` | `Server/plugins/Start.js:60` + both skills | `ai/<date>/day.jsonl` (20 KB today) | — | **nowhere** |
| `usage.json` | check-claude-usage | `ai/usage.json` | `usage.js` | index rail ✔ |
| `usage.jsonl` — 170 lines | new-task §2 | `ai/usage.jsonl` | — | **nowhere** |
| transcript | Claude Code | `~/.claude/projects/…/<sid>.jsonl` → `AILogs.js` `/ai-logs/:id`, loopback-only | `feed.js` `replay.js` | task page, uncapped |
| `directory.json` | dev server | `/framework/directory.json` | `dashboard.js` | task enumeration |

**Hooks are all wired** (`settings.json`: SessionStart·resume, PostToolUse·Edit|Write|NotebookEdit, PostToolUse·**Skill**, Stop, SessionEnd).
**The new skills fire** — proven from live logs: 74 `skill:` lines today — documentation 57, finish-task 7, new-task 6, css 4, layout 3, code 2, new-page 1, new-css-class 1.
Non-defects, checked and cleared: `usage.json` does carry the `limits` array `usage_rail` reads; 5 Active tasks, all 5 genuinely live (127 landed, 6 proposed) — no stale-Active rot.

## 2. What Mike actually sees (headless, networkidle + 2 rAF)

Measured on `/framework/ai/2026-08-16/mastermind-run/` @1440 — a busy task:

| region | y | height |
| --- | --- | --- |
| request + steps | 188 | 313 |
| figures + usage tables | 532 | 231 |
| **agents table** | 794 | **12,098** |
| **`outcome` — the answer** | 12,923 | 785 |
| chat | 13,794 | 114 |
| **`.ai-feed` — the transcript** | 13,939 | **235,034** |
| replay fold | 249,004 | 35 |

The page is **249,069 px**. The answer sits 5 % down it, under a 12,000 px table. 94 % is transcript.

## 3. Defects → causes

1. **The board renders twice on one screen.** `day-900.png`: the whole-archive rail (`ACTIVE 6`, clipped mid-card) sits in a 318 px scroll box over 25,703 px of content, then the day repeats the *same* cards below. Cause: `ai/page.js:23` `previews(){ return rail(this) }` keeps the rail mounted while a child routes inside it; `ai.css:214-218` then sizes it `flex: 0 0 min(22em, 34dvh)` at ≤64 em. **That is Mike's "50/50 vertical split, 2 scrollable rows."** The rule is wrong: a routed task doesn't want the archive above it at all — it wants it gone.
2. **The transcript is uncapped.** `feed.js:41` ingests every line, `feed.js:98` expands `t.flow` in full — 47 turns, 2,421 lines, 235,034 px. Mike's own messages *are* there; they're drowned in tool flow.
3. **The answer is last.** `AITask.js:96-102` `report()` runs `figures()` (3 tables) before `md(m.outcome)`.
4. **The task page drops its own deliverable links.** `card.js:81` renders `m.links` as pills; nothing in `AITask.js` does — 78 of 139 tasks carry links you can't reach from the task page.
5. **Two dead streams.** `day.jsonl` and `usage.jsonl` are written by every task and read by nothing. `ext/Timeline/ai.js` is imported by nothing.
6. **Custom content is a trap, not a feature.** `new AITask({ meta, extra(){} })` works (2 tasks use it) — but a task dir with its own `page.js` must be named in the day's `children:`, and `2026-08-17/page.js:11` names 2 of 51. Undeclared + own `page.js` → the generic viewer wins; declared + no `page.js` → 404.

## 4. Proposal — ranked by value ÷ cost

| # | problem → fix | cost |
| --- | --- | --- |
| 1 | Answer buried under 12 k px → reorder `report()`: **outcome · links · status · checklist · extra · shots · figures · chat · log**. | **S** |
| 2 | 235 k px feed → `open_turn()` renders the **prompt only**; `$flow` behind a click. Mike's messages become the feed. | **S** |
| 3 | Links unreachable on the task page → call `card.js`'s `.ai-links` row from `AITask.report()`. | **S** |
| 4 | Rail duplicated + clipped → `ai.css:214`: `display: none` on the rail when a child is routed, at any width. Delete the `34dvh` rule. | **S** |
| 5 | 12,098 px agents table → one row per agent, outcome trimmed to its first sentence, full text on click. | **S** |
| 6 | `day.jsonl` invisible → render it as the day page's header strip (opened/landed, one line each). | **S** |
| 7 | No per-task tabs → **Requirements · Report · Session** over `report()`'s existing named methods, as a local `.tab-bar` toggle. Routed `Page.prototype.tabs` (linkable URLs) is the M version. | S / M |
| 8 | `page.js` trap → day `route(name)` should load the dir's own `page.js` when one exists, and fall back to `AITask` when it doesn't — then no task ever needs declaring. | **M** |
| 9 | Sub-agents are table rows → give a spawned agent its own `ai/<date>/<parent>/<slug>/task.jsonl`; parent card shows N sub-cards. `ledger.mjs` already resolves by path, so it just works. | **M** |
| 10 | Delete: `ext/Timeline/ai.js` (no importer) and `usage.jsonl`'s append in new-task §2 — or render it. | **S** |

## 5. The single next step

**Do #1 + #2 together** — reorder `AITask.report()` and fold `feed.js`'s turns: two small edits in two files that turn a 249,000 px task page into roughly one screen with the answer at the top.
