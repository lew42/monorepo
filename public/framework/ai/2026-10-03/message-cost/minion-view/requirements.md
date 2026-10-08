# One view: every message, its clean version, and what the clean cost

## The owner's ask (verbatim, from the parent task)
> I want to see each message as I transcribe it... I want to see the cost of the
> transcription... it's really the clean transcription part... I don't know if those are
> being done via deltas, using deltas to update, you know, a raw transcription to make it a
> clean transcription.

Parent brief (read in full first): `public/framework/ai/2026-10-03/message-cost/requirements.md`.
Parent's "Want" list, items 1 and 3, are what this piece builds. Item 2 (voice refinement
actually running) and item 4 (cheaper) are a SIBLING minion's job (`../minion-cost-model/`) —
don't touch `Servex/agents/Sessions.js` or `Echo.js`, they're its fence, not yours.

## What already exists — read this before building anything

**The voice side already does most of this.** Don't rebuild it — extend it (CLAUDE.md law 6).

- `public/framework/ext/Session/Session.js`'s `entry(line)` (around line 185) already turns a
  `{refined: {...}}` log line into `{type: "refined", re, sentences, sections, flags, cost_usd}`.
- `public/framework/ux/Dictate/Widget.js`'s `draw_refined(entry)` (around line 520) already
  draws that as a `<details class="ux-dictate-widget-refined">` block right after the owner's
  own bubble: a `summary` reading `refined · $0.2077`, and the cleaned sentences grouped under
  headings inside. **It's closed by default** — open it with `<details open>` (or toggle it open
  the first time, whichever reads better in `ux-dictate-widget-refined.css`'s rules) so the
  clean text + its cost are visible without a click, which is the literal thing the owner asked
  for ("I want to SEE the cost," not "I want to find the cost").
- Prove it live: open `/framework/ux/Dictate/` (the widget demo), press 🎤 and say two real
  sentences (15+ words or 2+ sentences — shorter never gets refined, `worth_refining()` in
  `Sessions.js`), or use `curl -X POST http://127.0.0.1:8090/api/session/say` the same way the
  parent task's log describes, and watch the block appear under your own bubble within ~10s.

**What's missing #1 — a running total.** The owner's ask #1: "the running total for the session."
Nothing sums `cost_usd` across a session's `refined` lines today. Add it: a small always-visible
line (not inside the collapsed-no-more details — above the thread, e.g. beside the existing
"New session" button area, or a small fixed footer line) reading something like
`clean: $0.0812 this session` — recomputed from the `refined` lines already flowing through
`Widget.draw()`/`chat.js` (sum `entry.cost_usd` as each one arrives; no new fetch, CLAUDE.md
law 7 — the data is already in hand, just never added up).

**What's missing #2 — the VS Code / Dictate-chat side shows nothing.** Open
`/framework/ai/sessions/<id>/` for a REAL VS Code session that has echo data — e.g.
`/framework/ai/2026/10/03/session-60d9def6/` (check it still exists; if not, `ls
public/framework/ai/2026/10/03/` for a `session-*` folder with more than a couple of
`{"<uuid>": {"sentences"...}}` lines in its `page.jsonl`). Today `sessions/page.js`'s
`session_page()` function (around line 937) only shows raw prompt text, via `load_transcript()` —
it never reads or shows the echo clean/cost data that's RIGHT THERE in that same session's own
`page.jsonl`, one line per prompt, keyed by the prompt's own uuid:
```
{"content":{"add":{"type":"Prompt","text":"<raw>","id":"<uuid>","ts":"..."}}}
{"<uuid>":{"sentences":[{"n":1,"text":"..."}],"cost":{"usd":0.2095},"by":"echo-...","ts":"..."}}
```
Add a loader (`load_cost_log()`, right above `session_page()`, is the existing pattern for
reading this same `page.jsonl` — follow its shape) that reads `page.jsonl`, finds every
`{"content":{"add":{...}}}` prompt line (the existing `read_item`-style shape in `Echo.js`, see
its `read_item()` for both wire shapes it has to tolerate) and the matching `{"<id>": {...}}`
line keyed by that prompt's own `id`, and pass the pair to the SAME rendering you build/extend
for the voice side below.

## Build ONE shared row renderer, used both places (the owner's "same component" ask)

Pull the "raw text, then clean sentences + cost" rendering `Widget.js`'s `draw_refined()`
already has into one small, plain function both files import — e.g.
`public/framework/ux/Dictate/refined-block.js`, exporting something like
`refined_block({ sentences, sections, cost_usd })` that returns the `details`/`summary`/
sections view-tree `draw_refined()` already builds (move the body there, have `draw_refined()`
call it). Both this site's bubble renderer (`Widget.js`) and `sessions/page.js`'s own prompt
list import and call the exact same function — one visual shape, one place that ever needs a
fix (CLAUDE.md law 6: "every surface that shows the same thing uses the same component").

On `sessions/page.js`, under each prompt in `$box`'s existing `prompts.forEach(...)` block
(around line 990), call it with that prompt's own clean/cost data when your new loader found a
match for its `id`; when it didn't (no echo line yet, or an old session from before Echo
existed), show nothing extra — same "quiet skip, not an error" rule `draw_refined()` already
follows for an out-of-order replay. Add a running total here too, same idea as the voice side,
summed from whatever clean-cost lines this session's `page.jsonl` actually has.

## Done when

- A screenshot at 400 and at 1920 of **both** views — the Dictate widget demo
  (`/framework/ux/Dictate/`) with at least 3 real spoken lines each showing its clean text +
  cost open (not collapsed), and a VS Code session page (`/framework/ai/sessions/<id>/` or its
  date-path url) with at least 3 real prompts each showing the same clean text + cost. Use
  `node Server/layout-check.mjs <url...> --widths 400,1920` against your WORKTREE's own server
  (`message-cost.localhost`, or `http://localhost:<port>` — `worktree-up.mjs` printed the port;
  `MSYS_NO_PATHCONV=1` if you're in Git Bash and a path mangles).
- Both running totals visible in the screenshots and matching a hand-sum of the cost lines you
  can see on screen (cross-check it, don't just trust the number renders).
- Linked from `/framework/ux/Dictate/` (its readme or page, wherever a reader already lands)
  and from the session page itself (`sessions/page.js`'s own readme) — CLAUDE.md: "every page
  created is linked from somewhere a reader already is."

## Fence

- `public/framework/ux/Dictate/Widget.js`, its `.css`, and a new small `refined-block.js` (or
  whatever you name the shared renderer — keep the name obvious) beside it.
- `public/framework/ext/Session/Session.js` — only `entry()`, only if it needs one more field
  passed through (it already carries `cost_usd`; check before changing it).
- `public/framework/ai/sessions/page.js` (and `sessions.css` if a new class needs one rule).
- Readmes: `public/framework/ux/Dictate/readme.md`, `public/framework/ai/sessions/readme.md` —
  one short pointer each, no restating.
- Not `Servex/agents/Sessions.js`/`Echo.js` — that's the sibling minion's.
- No worktree of your own — the parent already has one at
  `C:\Code\lew42\worktrees\message-cost` (branch `worktree/message-cost`); work there, commit
  as you go.

## Load first

The `minion` skill, then the `page`/`content` skill before writing anything the owner reads
(the readme lines, if nothing else). `load_module(["ux/Dictate"])` — the parent task's own
investigation already read it once tonight; its findings above are accurate, trust them rather
than re-deriving, but open `Widget.js`, `Session.js`'s `entry()`, and `sessions/page.js` yourself
before editing any of them.

## Report back

One line to your parent (`task-mastermind-message-cost`) when done: the two screenshot paths,
the two urls proven, and your commit(s).
