# Refine — a dictation, turned into a brief, with nothing lost on the way

The owner's worry, in one line (`public/framework/ai/2026-09-29/prompt-refine/owner-words.md`,
2026-09-29 about 1:25 PM): a long, rambling, informal dictation may lower a model's quality, and
whatever summary gets made from it — by a human-in-the-loop VS Code tab, or by a mastermind — may
leave out details or quietly turn "maybe" into "must". **Refine is the audit trail that proves
what actually reached the mastermind is what the owner actually said.**

## Ask 1 first: is the raw text already kept and viewable?

Checked read-only, before writing anything (deliverable 1). Short answer: **yes, in two separate
places, both already durable** — a gap was expected here and wasn't found.

1. **Spoken dictation (whisper).** `public/framework/ux/Dictate/Dictate.js` — every finished
   utterance, straight from whisper's own `/inference` answer with no cleanup applied
   (`transcribe()`, line ~433; `close_segment()`, line ~400, calls `this.commit(text)` with that
   raw text), is logged via `log_prompt()` (line ~551): `{type:"prompt", by:"owner", text,
   via:"whisper"}`, sent to Servex's single-writer log (`/log/prompts`) or, if that's down, a
   dev-server fallback file, `public/framework/ai/prompts.jsonl` (confirmed present and growing
   in this repo). It's viewable two ways: **live**, in the dictation playground's own **Raw tab**
   (`public/framework/ux/Dictate/playground/Playground.js`, `TABS = ["raw", ...]` — the still-
   moving guess greyed, settled text in the page's own ink, never edited); and **historically**,
   `public/framework/ai/v/3/prompts.js` reads the persisted log back for the v/3 board. One open
   question this 10-minute check didn't chase down: whether that historical view covers the
   dev-server fallback file too, or only Servex's own log — worth a follow-up if the owner ever
   hits a dictation that isn't showing up.
2. **Typed prompts (any Claude Code session).** `.claude/hooks/prompt-relay.mjs`, the
   `UserPromptSubmit` hook, appends every prompt verbatim to `.claude/prompts/<day>.jsonl`
   (`{prompt:{at, session_id, author:"owner", text}}`) before anything else happens with it —
   git-ignored, per-worktree, one file per day. The only edit made to that text is withholding it
   if it matches a secret pattern (an API key, a private key, a JWT); otherwise it's the exact
   string submitted. This is `refine.mjs`'s own `<date>:<line>` input form, below.

Nothing here needed fixing — deliverable 1 said "if raw is NOT kept somewhere, say exactly where
it's lost; don't fix it," and it is kept, in both forms that reach a mastermind's brief.

## What `refine.mjs` is

One command, five files, each rung of a ladder written beside the one before it so any two can be
diffed:

```
node Server/refine.mjs <raw.txt | date:line> [--out <dir>] [--models haiku,sonnet] [--collab] [--mock]
```

- `<raw.txt | date:line>` — either a plain text file, or `<date>:<line>` (0-based) into
  `.claude/prompts/<date>.jsonl`'s `.prompt.text`, for a dictation that was typed straight into a
  Claude Code session.
- `--out <dir>` — where the files land (default: the current directory).
- `--models haiku,sonnet` — which models draft `structured.md`, cheap first (default). Each gets
  its own `structured-<name>.md`; the winner becomes `structured.md`.
- `--collab` — the pick among structured drafts goes through `Server/collab.mjs`'s own real vote
  (real Servex agents, real cost — see "Reuse, not a third engine" below). Without it, one cheap
  judge call (Haiku) picks or merges.
- `--mock` — every step is deterministic and model-free; the whole pipeline, including the
  `--collab` hand-off, can be proven for $0 before spending anything real.

### The five files

| file | what it is |
|---|---|
| `raw.txt` | the input, byte for byte |
| `clean.md` | near-verbatim: fillers gone, typos/punctuation fixed, nothing else changed — every sentence numbered `S1, S2, …` |
| `structured-<model>.md` (one per model) then `structured.md` (the winner) | the owner's ideas as an outline, in the owner's own words, every bullet citing its sentences `[S3, S7]` |
| `brief.md` | numbered asks for a mastermind, each citing its source sentences; a hedge ("maybe") becomes "the owner suggests", never a flat rule |
| `coverage.md` | **the audit — the actual point of the tool.** Every clean sentence traced to an ask, "context only", "dropped, because …", or (if the model never answered for it) "unclassified" |
| `refine.json` | models used, cost per step, word counts at each rung, the coverage numbers |

### `coverage.md`, in miniature (a 4-sentence `--mock` run)

```
| S# | sentence | -> |
|---|---|---|
| S1 | Okay so I think, we should, build a new page for the dashboard. | ask #1 |
| S2 | It's, really important that we, we track the daily usage numbers there. | ask #1 |
| S3 | Maybe we could also add a chart, I'm not sure though. | ask #2 |
| S4 | The mastermind should always ask before deleting a card. | ask #2 |
```

The table is built **mechanically first** — a plain count of which ask cites which sentence
number — and only the *uncited* rows go to a model to classify as "context only" or "dropped".
Every other row, and every flag below it, is a word count against the transcript text, not a
model's opinion. Three flags, all mechanical:

- **strength word** — an ask uses "must"/"never"/"always"/"only" that its own cited sentence(s)
  don't contain (a suggestion turned into a rule, the owner's exact worry).
- **new words** — a content word in an ask that is nowhere in the *whole* transcript (checked
  against everything the owner said, not just what that ask cites, so normal paraphrase from
  elsewhere in the same dictation is never flagged — only a word that was never said at all).
- **thin citation** — an ask cites a sentence but shares no wording with it at all: the citation
  is there in form, but the ask may not actually reflect what that sentence said. Marked inline,
  right in the sentence-coverage row (`ask #2 (thin)`), as well as listed in the Flags table.

## Multi-model structured drafting, and the scoreboard

Each model in `--models` drafts `structured-<name>.md` independently from the same numbered
`clean.md` — no reading each other's work. Then:

- **Without `--collab` (the default, and what the required sample run below used, for budget):**
  one cheap Haiku call reads every draft, picks a base or merges the best of each, and says which
  it started from (`WINNER: <name>` as its first line, stripped before saving).
- **With `--collab`:** each draft is pre-seeded as that model's own file inside a
  `collab-structured/` sub-run, and `Server/collab.mjs` runs its OWN real vote over them (see
  `Server/doc/collab.md`) — real Servex agents, real cost, but its full machinery: every option
  keeps a vote count (zero included), every voter's caveat is kept, and a scoreboard line lands in
  the shared `public/framework/ai/collab/scoreboard.jsonl`, same as any other collab run.

  This needed one small addition to `collab.mjs` itself: a `phase.given: true` flag a phase can
  carry, meaning "the caller already wrote this phase's file — don't spawn an agent to make it,
  just confirm it's there." Without it, collab would have re-drafted `structured.md` itself
  (spawning fresh agents to redo work `refine.mjs`'s own models already did), doubling the cost
  for no reason, and there was no other way to make collab vote over content it didn't create
  itself. Every existing `collab.json` (research, design) is unaffected — `given` is
  undefined/falsy unless a phase sets it, so this is the smallest change that made the reuse
  possible rather than writing collab's vote logic a second time inside `refine.mjs`.

Either way, one line is appended to `Server/refine-scoreboard.jsonl`
(`{at, input, models, winner, costs}`) per run, so over many runs it can say which model actually
refines best — separate from `collab.mjs`'s own shared scoreboard, which only fills in on
`--collab` runs.

## Reuse, not a third engine

Every model call goes through `askOnce`, exported from `Server/ask-each.mjs` (its own `main()` is
now guarded so importing it for `askOnce` doesn't also run its CLI). The `--collab` path goes
through `Server/collab.mjs` unchanged except for the `given` hook above. `refine.mjs` makes no
direct SDK or MCP call of its own.

## The required sample run

`public/framework/ai/2026-09-29/prompt-refine/runs/sample/` — the owner's own 522-word dictation
about this exact worry (`owner-words.md`'s "The owner, verbatim" section), run without `--collab`
(budget), default models (Haiku then Sonnet).

**PLACEHOLDER — filled in once the real run finishes (in progress as this doc is written):**
command, cost, word counts, and the coverage numbers (sentences / cited / context-only / dropped /
unclassified / flags / thin-citations), plus what reading `coverage.md` by hand found.

## Costs measured

- `--mock` (both with and without `--collab`): $0, proven — see the task log.
- The required real sample run: see the numbers above once filled in.
- Ask-1's own check: $0 (read-only, no model calls).

## What's left, honestly

- `--collab`'s real (non-mock) path is wired and `--mock`-proven, but not yet proven with a real
  paid run — the brief's own budget note for the required sample explicitly said to run it
  *without* `--collab`, so this is a known, sanctioned gap, not an oversight.
- The historical viewer question above (does `ai/v/3/prompts.js` read the dev-server fallback
  log too, or only Servex's own) — flagged, not chased down; ask-1 was scoped to 10 minutes.
