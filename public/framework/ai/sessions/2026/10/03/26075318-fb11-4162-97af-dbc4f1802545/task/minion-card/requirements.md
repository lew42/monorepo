# minion-card: the prompt card + logging the reply

Load the `minion` skill first. Parent task: `/framework/ai/2026-10-02/prompt-refine/` (read its
`requirements.md` — the owner's verbatim words are at the top). This brief covers deliverables 5
and 6 only. Worktree: `C:\Code\lew42\worktrees\prompt-refine` (branch `worktree/prompt-refine`).

A sibling, `minion-core` (its own dir beside yours), is building
`public/framework/ext/Refine/refine.js` — a shared `clean()`/`structure()` engine with a
documented return shape (sentences, strikes, misheard, flags+confidence). It may not be landed
yet — don't block on it: build against the shape it documents in
`public/framework/ext/Refine/doc/refine-engine.md` (read that file; if it's missing because
they're not done yet, use the shape in THIS brief's deliverable-1 section of the parent
`requirements.md` as your contract, and leave a note in your log if you had to guess). You do NOT
need to call `refine()` yourself to get this landed — read-only on `minion-core`'s files.

## Read first (what already exists — law 6)
- `public/framework/ai/v/3/prompts.js` — **this already draws "a prompt, and what was made of
  it, side by side, newest on top"** via `prompt_stream()`/`threads()`: each prompt's thread
  gathers `refined` (a cleaned reading citing sentence numbers), `names`, `cards`, `proposals` —
  all children of the prompt event, via `fold()`. Read this file and `fold.js`
  (`ai/2026-09-22/log-model/fold.js`) whole before writing a new card component — the
  "prompt + my reply as one exchange" (deliverable 5's last sentence) may be mostly this
  already; your job is the MODES (Condensed → Structured → Clean → Raw), not a new thread view.
- `Servex/agents/Assistant.js` — writes the `refined` event type today (a cleaned reading with
  `cites`). This is close to "Clean" mode already; you're adding the other 3 modes and the
  mode-switch UI on top of what's already drawn.
- `.claude/hooks/prompt-relay.mjs` — the `UserPromptSubmit` hook pattern: reads hook JSON on
  stdin, writes to `.claude/prompts/<day>.jsonl`, never throws, never blocks. Your Stop hook
  (below) is the same shape, the other direction.
- `.claude/settings.json`'s `"Stop"` array already runs `.claude/hooks/ledger.mjs stop` — that
  file is about AGENT task-ledger bookkeeping, not what you're adding; don't touch it. Add a
  SEPARATE hook, registered as a second entry in the same `"Stop"` array.

## Deliverable 5 — the prompt card: four modes, prompt + reply together

Each logged prompt (`.claude/prompts/<date>.jsonl` and, once Daily logged, the Servex prompt log
`threads()` already streams) gets a refined card with a mode switch:

**Condensed** (headings only, each self-explanatory and clickable) → **Structured** → **Clean**
→ **Raw**. Build this as a small, reusable piece — a `modes` toggle plus 4 render functions —
that both `ai/v/3/prompts.js`'s live thread view AND a plain historical list (for a prompt that
has no live `refined` event yet, just raw clean/structured output from `minion-core`'s engine or
from `Server/refine.mjs`) can use. Don't build two card components — one, reused (law 6).

- **Condensed**: the `structured()` step's headings ONLY, each a clickable line that jumps to
  Structured mode scrolled to that heading. If structure hasn't run, condensed = the first
  sentence + "…" (never blank).
- **Structured**: the full heading/bullet outline (reuse `ext/Refine/Refine.js`'s
  `parse_structured` shape if that fits, or `minion-core`'s `structure()` output directly).
- **Clean**: the near-verbatim text, sentence by sentence.
- **Raw**: the byte-for-byte original.
- **The owner's reply sits beside or below the prompt**, same card, not a separate one —
  `threads()`'s existing `prompt` + whatever you wire for the reply (deliverable 6, below) is
  the pairing; render them as one card with two halves (ask / answer), not two cards.

Build this where `ai/v/3/` already lives (it owns the prompt timeline) — a new file there, e.g.
`ai/v/3/prompt-card.js`, imported by `prompts.js`. Keep the diff small: don't restructure
`prompts.js`'s existing rendering, add the mode switch to what's already drawn for a prompt's
"refined" section.

## Deliverable 6 — log the reply too

New Stop hook, `.claude/hooks/reply-relay.mjs`, modeled on `prompt-relay.mjs`'s shape (reads JSON
on stdin: `{session_id, transcript_path, cwd, hook_event_name}`; never throws; exits 0 printing
nothing that would block the stop).

1. Only for **the owner's own interactive sessions** — not an agent/minion's. Cheapest reliable
   test: the hook's own `session_id` already has at least one `{"prompt":{...,"session_id":
   "<this one>", "author":"owner",...}}` line in TODAY's `.claude/prompts/<day>.jsonl` (same file
   `prompt-relay.mjs` already writes — an agent spawned by Servex never writes a prompt line
   there with "owner" as the author into THIS tree's file the same way, so absence is a safe
   skip). If you find a cleaner existing signal (check how `every-prompt`'s hook marks a session,
   or how `ledger.mjs` tells agent sessions from interactive ones) use that instead — say which
   in your log.
2. Read `transcript_path` (a JSONL transcript Claude Code already writes), find the LAST
   assistant text message in it, and append:
   `{"reply": {"at": "<ISO now, local offset — copy prompt-relay.mjs's own now()>",
   "session_id": "<session_id>", "text": "<the reply text>"}}`
   to the SAME `.claude/prompts/<day>.jsonl` the prompt lines go to (so prompts and replies pair
   by session_id and time, per the owner's own words).
3. Register it in `.claude/settings.json`'s `"Stop"` array as a second hook entry (same shape as
   the existing `ledger.mjs stop` entry, new command pointing at `reply-relay.mjs`). Run it once
   by hand (`echo '{"session_id":"test","transcript_path":"...","cwd":"..."}' | node
   .claude/hooks/reply-relay.mjs`) against a real transcript file before you call this done — the
   skill's own rule: "run any command you put in a brief once yourself first."

## Fence
- `public/framework/ai/v/3/prompt-card.js` (new), small edits to `prompts.js` to use it.
- `.claude/hooks/reply-relay.mjs` (new), one new entry in `.claude/settings.json`'s `Stop` array.
- Do not touch `minion-core`'s files (`ext/Refine/refine.js`, `structure.js`,
  `Server/refine-litmus.mjs`), `ux/Dictate/*`, or `Servex/agents/Assistant.js` beyond reading it.
- Run `node Server/smoke.mjs <this worktree path>` on `/framework/ai/v/3/` before you report done.

## Land
Commit as you finish each deliverable (two commits). Log decisions/caveats to
`/framework/ai/2026-10-02/prompt-refine/minion-card/task.jsonl` (create it with the launch
`assign` line first, per `new-task`). A screenshot of the prompt card showing at least 2 modes,
at 1920 — `node Server/layout-check.mjs` or a headless shot — before you say done. Stop and tell
your parent what you built and where the screenshot is.
