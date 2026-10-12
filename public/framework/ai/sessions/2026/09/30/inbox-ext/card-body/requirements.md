# Minion brief: the card body shows the refined dictation; no ai2.css

Load the `minion` skill first, then `code` and `css`. Parent: task-mastermind-inbox-ext.
Task dir: `public/framework/ai/2026-09-30/inbox-ext/` — read its `requirements.md` (asks 7
and 9 are yours), `owner-words.md` and `plan.md` (items 5 and 7) before anything.

**This file did not exist when minion-card-body started** (task.jsonl line 69 says it was
written, but it wasn't). Reconstructed from [`../rail/requirements.md`](../rail/requirements.md)'s
"Next: merge 5" section (word for word) and [`../plan.md`](../plan.md) item 7, which is
where the actual brief content already lived. minion-card-body wrote this file itself so the
record is correct for the next reader, per the skill's "resolve, don't park."

## Where you work

Worktree `C:\Code\lew42\worktrees\inbox-ext` (branch `worktree/inbox-ext`, server
`http://localhost:51490/`). It already holds merges 1–3 (`InboxRail`, `AIRail`, the AI page's
Inbox/Log/System tabs — fast-forwarded from `michael/dev`). Commit after each finished piece.
Don't merge; the task mastermind merges.

## Piece 1: merge 5, a card body shows the refined dictation (asks 7 and 9)

Verbatim from `rail/requirements.md`:

> The owner's words are asks 7 and 9 in `../requirements.md`: "Chat and card are ONE content
> model". The sidebar is chat mode (informal); the card is page mode (the refined, final
> points). The flow runs right to left: while a card is selected and the owner dictates, the
> refinement is written into that card's page.jsonl.
>
> The Servex side has landed (49f93b37, live after the next Servex restart). It appends one
> line per refinement to the selected card's page.jsonl:
> `{"chat":{"at","session","path","from":{"kind":"assistant","id":"smart"},"via","text","card","level":"clean"|"edit"|"summary","re"}}`
>
> Deliverables:
> 1. The card's detail view (the one a rail row opens, on /framework/ai/ and /framework/ai2/)
>    draws these lines at the top of its body. `summary` and `edit` lines are the card's
>    points, newest first. `clean` lines fold under them in a closed `details` ("what was
>    said, cleaned up"). A card with none of these lines looks exactly as it does today.
> 2. One drawing, not two (law 6): if the card page already draws `chat` lines anywhere,
>    extend that; don't add a second renderer.
> 3. Prove it with a fixture: append three lines (one of each level) to a throwaway card in
>    the WORKTREE only, shoot it at 400 and 1920, then remove the fixture. Never write to a
>    real card's page.jsonl in the main tree.
> 4. The example card for ask 7 is
>    `/framework/ai2/2026/09/30/now-one-inbox-everywhere-and-refined-pro/` (empty). Note in
>    your report what lines it would need; the mastermind posts them by hand after the merge.
>
> Commit when it works, and say the commit id. Merge 6 (each System's Inbox tab uses
> InboxRail) waits until `core/System` lands from worktree/ui-system.

Checked before starting: `public/framework/ai2/card.js` handles one line per kind of content
(`message`, `prompt`, `item`, …, each its own method, dispatched by `core/Page/Log.js`'s
generic `set()`). Nothing in the file reads a `{"chat": {...}}` line with a `level` today —
`chat_entries()`/`chat_line()` only read `message` lines, for the OLD sidebar
(`chat_v1()`, off by default). So deliverable 2's "already draws chat lines" doesn't apply
literally; this is the first and only renderer for this line shape. The existing
`this.refined?.text` fold in `more()` is a DIFFERENT, older mechanism (Servex's
`agents/Layers.js`, `{"type": "refined"}`, one value, latest wins) — out of this fence,
left alone.

Verified `Servex/agents/Sessions.js` `line()` (the landed 49f93b37): the exact shape is
`{at, session, path, card, from: {kind:"assistant", id:"smart", agent}, via:"text", text,
re, level}`, and it is only appended to a card (`cards.append`) when both `card` and `level`
are set — so the card's page.jsonl only ever sees leveled lines, never a plain chat echo.

## Piece 2: merge 7, no more `ai2.css`

Verbatim from `../plan.md` item 7 and the "Next, in order" section:

> **No `ai2.css`** (last). What is left of it (card bodies, the overview) moves into ui/ux
> blocks; AI 2 imports those blocks, so it still looks the same, and `ai2.css` is deleted.
> Page CSS keeps only overrides.
>
> Merge 7, no ai2.css. It is at 1,993 lines (after merge 1 moved the rail out); move what
> remains into `ux/Inbox` or a new `rail.css`-style module CSS file.

Start piece 2 only after piece 1 is committed and reported. Read `ai2.css` fresh at that
point — merge 1 already moved the rail's own rules out (2689 → 1993 lines); what is left is
card bodies, the overview, the board/live faces, and AI 2's page chrome. Follow the `css`
skill's ladder (nothing → utility class → layout word → component class → module CSS) before
adding anything: most of what's left probably becomes a `ux/` block the same way the rail did,
with `ai2.css` kept only for AI-2-specific overrides (or deleted outright if nothing is left
that isn't already generic).

## Fence

`ai2/card.js`, `ai2/chat.js` (read-only unless a helper must move), `ai2/ai2.css`,
`ux/Inbox/**` (existing, from merge 1 — extend, don't fork), a new `ux/` block only if piece 2
needs one. A throwaway fixture card folder under the WORKTREE's own
`public/framework/ai/2026-09-30/inbox-ext/card-body/fixture/` (removed before you report).
Nothing in Servex, `core/Page/*.js`, or other `ai2/*.js` files unless one import line must
change — say so in your log.

## Rules

`windowsHide: true` on every process; stop every server you start except the worktree's own
(:51490, already running — don't start a second one). Log each step and decision in your
task.jsonl (`public/framework/ai/2026-09-30/inbox-ext/card-body/task.jsonl`, in the MAIN tree,
same as every other sibling task dir here — not the worktree's copy). When done, message
task-mastermind-inbox-ext: commits, the shots, what's left. No cap: do it right, not fast.

