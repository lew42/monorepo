# minion-core: the shared refine() engine

Load the `minion` skill first. Your brief's parent task: `/framework/ai/2026-10-02/prompt-refine/`
(read `requirements.md` there — the owner's verbatim words are at the top). This brief covers
deliverables 1, 2, 3 and 7 only. You work in this worktree:
`C:\Code\lew42\worktrees\prompt-refine` (branch `worktree/prompt-refine`, server already running —
ask your parent for the port if you need it, or run `npm run dev` style check via `node
Server/smoke.mjs` before you're done).

## What exists already (read before writing anything — law 6, don't build a second one)
- `Server/refine.mjs` — a CLI tool that already does clean → structured → brief → coverage, via
  model calls through `Server/ask-each.mjs`'s `askOnce`. Read it whole, and `Server/doc/refine.md`.
- `public/framework/ux/Revise/Revise.js` — the pattern for a browser-side module that calls a
  Servex route and never throws (`{ok, text, ...}` or `{ok:false, why}`). The real prompts live
  server-side in `Servex/agents/tidy.js`.
- `public/framework/ext/Refine/Refine.js` — a VIEWER of one refine.mjs run (raw/clean/structured/
  brief columns + coverage table). Not what you're building — you're building the engine it could
  one day point at, but don't touch this file.

## The job

**One function, two speeds** (deliverable 1). Build `public/framework/ext/Refine/refine.js` (a
new file, plain ESM — it must run unchanged in the browser AND under Node, since both Dictate
(browser) and the prompt-log processor (Node, for deliverable 5/6's work, done by a sibling
minion) call it):

```js
import { clean } from "/framework/ext/Refine/refine.js"; // or relative path under Server/
const result = await clean(text, { prev });
// result = {
//   text,              // the cleaned text
//   sentences,         // [{n, text}] — every sentence, numbered, near-verbatim
//   strikes,           // [{sentence_n, struck_text}] — a self-correction ("no wait, I meant...")
//   misheard,          // [{sentence_n, from, to}] — a word fixed against the glossary below
//   flags,             // [{sentence_n, question}] — an unclear passage + a clarification question
// }
```

`prev` (optional) is the tail of already-cleaned text, for streaming: Dictate calls `clean()`
once per finished utterance with `prev` = the last ~2 sentences already settled, so a
self-correction that spans a segment boundary ("wait, not blue — green") can still be caught.
That IS the "two speeds" — one call, called once on a whole logged prompt, or many times in a row
on live segments. There is no separate "stream mode" flag; streaming is just calling it more
than once with growing `prev`. Decide this is right, or pick something clearer — it's your call,
just document which you picked and why in the file's own doc comment.

The model call itself goes through `Server/ask-each.mjs`'s `askOnce` when run from Node, and
through a Servex route (same shape as `Revise.run` → `/api/tidy`) when run from the browser —
**reuse, don't fork the prompt text**: the clean prompt wording should live in ONE place
(`Servex/agents/tidy.js` already has a "clean" level prompt — extend THAT, add the glossary/
strike/flag instructions to it, rather than writing a second copy in `refine.js`). `refine.js`
itself does the checks below in plain JS (no model call needed for the checks — they're
mechanical, on the model's own output).

### 2. Clean = near-verbatim, enforced by code

After the model returns its "clean" text, **diff-check it against the raw input, word by word**
(a simple content-word diff is enough — see `Server/refine.mjs`'s `coverage.md` flags, "strength
word"/"new words", for the kind of check already in this repo; reuse that logic rather than
writing a new diff algorithm if it fits). Reject (fall back to the raw text, log why) a clean
line that ADDS or REPLACES a content word, with two exceptions:
- **a) an explicit self-correction** — the owner says "no, not X, I meant Y" or similar — kept as
  a `strikes` entry (X shown struck through, Y kept) rather than rejected.
- **b) a glossary fix** — a mis-heard word corrected to a known name. Build the glossary from
  `CLAUDE.md` (root + `public/framework/ai/CLAUDE.md`) and the module names under
  `public/framework/*/*/readme.md` (first line of each, or the dir name) — a short list of
  proper nouns Whisper/typing commonly mangles. Keep it a plain exported array/function so it's
  easy to extend; don't over-engineer a fuzzy-match library — closest-word-by-edit-distance
  against the glossary list is enough (write ~20 lines, don't add an npm dependency).

### 3. Structure = every sentence placed, checked by code

Build `structure(sentences)` in the same file (or a sibling `structure.js` if that reads cleaner
— your call): sends the numbered clean sentences to a model (reuse `Server/refine.mjs`'s
`structured` rung prompt — don't rewrite it) asking it to group them under headings, then a plain
JS check: **every sentence id S1..Sn appears in the result EXACTLY once.** Missing → the whole
run fails loudly (throw / return `{ok:false, missing:[...]}`) rather than silently dropping it —
this is deliverable 3's "a missing sentence fails the run." `Server/refine.mjs`'s own
`coverage.md` building code already does nearly this; read it before writing a new version.

### 4's flag mechanics (not the sound — that's Dictate's job, a sibling task)
`clean()`'s `flags` array (above) is deliverable 4's data half: an unclear passage (the model
couldn't confidently clean it, or a glossary word fix was a low-confidence guess) gets a
`{sentence_n, question, confidence}` entry (`confidence` 0-1; the owner's own words, via
vscode-mastermind, 2026-10-02: "each ask carries a confidence; low confidence becomes a
clarification question" — same mechanism, applied one level down at the sentence) — the
question is "answerable later" (plain text, no UI needed here). You are NOT touching `ux/Dictate` — a sibling mastermind (`@task-mastermind-one-dictation`)
wires Dictate's clean step onto your module and adds the sound; just make sure `flags` is there
and documented clearly enough that they can wire `on_flag` themselves. Add one optional callback
param, `onFlag(flag)`, fired synchronously as each flag is found, so a live caller (Dictate) can
react immediately rather than waiting for the whole result — cheap to add, don't skip it.

### 7. The litmus test — 3 cheap models, picked by data

Write `Server/refine-litmus.mjs` (CLI, `node Server/refine-litmus.mjs <raw.txt|date:line>`): runs
your `clean()` step against **3 cheap models** (e.g. `claude-haiku-4-5`, and two others — check
`Server/ask-each.mjs` or `.claude/agents/*` for what other cheap/fast models are already wired
into this repo's model ladder before inventing new ids), on ONE short real prompt (pull one from
`.claude/prompts/2026-10-02.jsonl`, something under ~100 words). For each model, run your
mechanical diff-check (deliverable 2) and report: did it pass clean (no invented content), cost,
latency. Print a one-line verdict: which model wins, by the numbers, and write it to
`Server/refine-litmus-result.json`. No opinion needed — the diff-check already decides pass/fail;
ties go to the cheapest. This is literally "the first rung of the model ladder, machine-checked."

## Fence
- `public/framework/ext/Refine/refine.js` (new), `public/framework/ext/Refine/structure.js` (new,
  optional), `Server/refine-litmus.mjs` (new), `Server/refine-litmus-result.json` (new, your
  output).
- Touch `Servex/agents/tidy.js` only to EXTEND the existing "clean" prompt (add glossary/strike/
  flag instructions) — don't replace it, don't touch the "edit"/"summary" levels.
- Do not touch `ux/Dictate/*`, `ext/Refine/Refine.js`, `ext/Refine/page.js` or
  `public/framework/ai/v/` — other work owns those.
- Run `node Server/smoke.mjs <this worktree path>` before you report done, and fix anything it
  flags in files you touched.

## Land
Commit in this worktree as you finish each piece (clean, structure, litmus — three commits, not
one). Write a short `public/framework/ext/Refine/doc/refine-engine.md` (link it from
`ext/Refine/readme.md`'s "More" list — one line) saying what `clean()`/`structure()` return and
the glossary/diff-check rule, so the Dictate mastermind and the prompt-card minion can wire
against it without reading your source. Log each step (`decision`, `log`) to
`/framework/ai/2026-10-02/prompt-refine/minion-core/task.jsonl` as you go (same append.mjs route,
your own task dir — create it with the launch `assign` line first, per the `new-task` skill).
Stop when done; tell your parent what you built, the doc path, and the litmus verdict.
