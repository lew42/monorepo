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

## Who runs this, and when

`refine.mjs` is a manual audit tool, run by hand from a terminal — nothing in `ux/Dictate` or
`ext/Chat` calls it, and no mastermind runs it automatically after a dictation. Run it yourself
against a dictation's raw text (or a `date:line` into a typed prompt log, see below) whenever you
want the audit trail this doc describes.

## What `refine.mjs` is

One command, five files, each rung of a ladder written beside the one before it so any two can be
diffed:

```
node Server/refine.mjs <raw.txt | date:line> [--out <dir>] [--models haiku,sonnet] [--collab] [--mock] [--repair-rounds N | --no-repair] [--config <rungs.json>] [--model-<rung> <model>]
node Server/refine.mjs --coverage-only <dir> [--mock]
node Server/refine.mjs --repair-only <dir> [--mock] [--repair-rounds N]
```

- `<raw.txt | date:line>` — either a plain text file, or `<date>:<line>` (0-based) into
  `.claude/prompts/<date>.jsonl`'s `.prompt.text`, for a dictation that was typed straight into a
  Claude Code session. **`.claude/prompts/` is git-ignored and PER-WORKTREE** — the
  `UserPromptSubmit` hook (`prompt-relay.mjs`) writes into whichever tree the typing session's
  `cwd` was, so a prompt typed in the main tree's own session is not in a worktree's copy of that
  day's log, and the other way round. `date:line` is looked up in THIS tree first, then in the
  main tree (found via `git rev-parse --git-common-dir`, whose parent is always the main tree's
  root, worktree or not) — `refine.json`'s `source_file` says which one it actually read. If
  neither tree has that day's file, or that line, the error names both paths it tried.
- `--out <dir>` — where the files land (default: the current directory).
- `--models haiku,sonnet` — which models draft `structured.md`, cheap first (default). Each gets
  its own `structured-<name>.md`; the winner becomes `structured.md`.
- `--collab` — the pick among structured drafts goes through `Server/collab.mjs`'s own real vote
  (real Servex agents, real cost — see "Reuse, not a third engine" below). Without it, one cheap
  judge call (Haiku) picks or merges.
- `--mock` — every step is deterministic and model-free; the whole pipeline, including the
  `--collab` hand-off and the repair round, can be proven for $0 before spending anything real.
- `--repair-rounds N` / `--no-repair` — the repair round (below) runs once by default; raise it to
  chase down multiple waves of drops, or turn it off entirely.

### The five files

| file | what it is |
|---|---|
| `raw.txt` | the input, byte for byte |
| `clean.md` | near-verbatim: fillers gone, typos/punctuation fixed, nothing else changed — every sentence numbered `S1, S2, …` |
| `structured-<model>.md` (one per model) then `structured.md` (the winner) | an information hierarchy: one `#` H1 naming the subject, `##` H2s with familiar names for its parts, bullets (nested for sub-points) in the owner's own words, every bullet citing its sentences `[S3, S7]` |
| `brief.md` | numbered asks for a mastermind, each citing its source sentences; a hedge ("maybe") becomes "the owner suggests", never a flat rule |
| `coverage.md` | **the audit — the actual point of the tool.** Every clean sentence traced to an ask, "context only", "dropped, because …", or (if the model never answered for it) "unclassified" |
| `brief-v1.md` (only if the repair round changed anything) | the brief exactly as first drafted, kept so it can be diffed against the repaired `brief.md` |
| `refine.json` | models used, cost per step, word counts at each rung, the coverage numbers, the repair round's before/after |

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

Every citation is a single sentence number — `citationsIn()` also expands a written range like
`[S6-S9]` or `[S6–S9]` to every number inside it, so a model that writes a range doesn't make its
own sentences look uncited, but every prompt that produces a citation is told not to write one
(a range hides which specific sentence backs which part of an ask).

## The structured rung: a hierarchy, not a summary (2026-09-29)

The owner, about 8:20 PM: the structured rung "only condenses"; he wants familiar names as headings,
"tangible, familiar, easy to digest". So it writes **one `#` H1** naming the concrete thing
being discussed ("Page class", never "AI processes"), **`##` H2s** for its parts (a name that
already exists, like "Layout", or the speaker's own word), and **one bullet per point, at most two
levels deep**. Sentences that make one point merge into one bullet; every sentence is still cited,
exactly once, so nothing is lost.

The first version kept one bullet per sentence, nested up to six deep (review finding 8). Proof,
same clean sentences and same model (Sonnet), only the prompt changed:
[`b-structure/out/`](/framework/ai/2026-09-29/audio/next-clean-transcription/b-structure/out/),
one folder per dictation, `structured-before.md` beside `structured-after.md`, with
`check.txt` counting bullets, depth, and sentences cited twice or never.

To compare on another dictation: `node Server/refine/compare-structured.mjs <raw.txt> <out-dir>`.
Measured: $0.36 for a 550-word dictation, $0.58 for 1,700 words. `--after-only` reruns just the new
prompt on an existing folder ($0.23 for the 1,700 words).

## Each rung's model and prompt, in one table

`RUNGS`, at the top of `refine.mjs`, lists all six rungs (`clean`, `structured`, `pick`,
`brief`, `coverage`, `repair`) with their model. To change one:

- `--model-<rung> <model>`, for example `--model-brief haiku`. `--model-structured <m>` is the
  same as `--models <m>` (the structured rung is the one that drafts with several models).
- `--config rungs.json`, for example `{ "clean": { "model": "sonnet", "prompt": "... {{INPUT}} ..." } }`.
  A `prompt` replaces that rung's whole prompt; `{{INPUT}}` becomes its input text. Only
  `clean`, `structured` and `brief` take a prompt, because the other three are built from several
  pieces at once. A `--model-<rung>` flag wins over the config file.

## The repair round: coverage catches a drop, this closes it

Catching a drop isn't the same as fixing it. After `coverage.md` is built, if anything came back
**dropped** or **thin**, one more Sonnet call reads the current `brief.md` plus just those
sentences and returns ONLY the new or amended asks needed — each still citing its sentences, in
the owner's own words, a hedge still a hedge. The asks are merged into `brief.md` (the original is
kept as `brief-v1.md`), and coverage is rebuilt against the repaired brief. On by default, one
round (`--repair-rounds N` for more, `--no-repair` for none); `refine.json`'s `repair` block
records `dropped_before`/`dropped_after` and `thin_before`/`thin_after` so the fix is provable, not
just claimed. A round that finds nothing to fix costs $0 (the classifier only ever runs on
something uncited). `--repair-only <dir>` runs just this round against a run dir that already has
a `brief.md` — no need to redraft `clean.md`/`structured.md`/`brief.md` to fix a coverage gap.

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

  **A tie is not a quality signal.** `runs/b` hit a real 1-1 vote, and collab's own tie-break
  ("cheaper member" — price, not quality) picked one arbitrarily and spent real money doing it. On
  a tie (the decision line's `tie_rule` is set), `refine.mjs` now ignores that pick and falls back
  to the same cheap judge call the non-collab path uses, so the tied vote's spend at least buys a
  real decision. And **on a clean win, the vote's caveats are now actually applied** — one more
  small judge call (`applyCaveats`, $0 when there's nothing to apply) revises the winning draft to
  address them, instead of the old behavior of just listing them under it as a footnote nobody
  read.

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
(budget), default models (Haiku then Sonnet):

```
node Server/refine.mjs <path to the dictation's raw text> --out public/framework/ai/2026-09-29/prompt-refine/runs/sample
```

**Cost:** $0.4158 total (clean $0.1343, structured $0.0407 + $0.1039, pick $0.0342, brief $0.1028,
coverage $0 — every sentence was cited, so the classifier never had to run).
**Word counts:** raw 522 → clean 459 → structured (winner: Sonnet) 272 → brief 262.
**Clean overlap ratio:** 1.0 (every content word in `clean.md` is present in `raw.txt`).
**Coverage:** 9 sentences, all 9 cited by an ask, 0 dropped, 0 unclassified, 0 thin citations, 5
flags (down from 7 before the "new words" fix below).

Reading `coverage.md` by hand: every one of the owner's 9 sentences reached an ask — nothing
dropped, nothing silently missing. The flags are minor, expected paraphrase-drift (an ask says
"ensure" where the owner never used that exact word, for instance), except one real, useful catch
the coverage table surfaced on its own: **asks #1 and #6 both used the word "investigate"** — the
brief turned the owner's stated *worry* ("I'm a little worried that my long rambling
transcriptions pollute the IQ of the LLM") into an *investigation task*, which is a reasonable
reading but not something the owner said in those words. Exactly the kind of thing this tool is
for catching.

### Two fixes from reviewing this run (owner, 2026-09-29 ~3pm)

1. **The "new words" flag was too noisy at first** — 7 flags across 7 asks, mostly plain
   inflections (`toward`/`towards`, `choose`/`choosing`, `explicit`/`explicitly`,
   `dictated`/`dictating`, `summarizes`/`summarizing`) being read as brand-new words, which buried
   the one real catch above. Fixed with a crude stemmer (strip `'s`/`n't`/`ing`/`ed`/`es`/`s`, then
   treat two stems as matching if the shorter is a prefix of the longer — needed because the fixed
   suffix list alone still leaves `explicit` and `explicitly` at different lengths), plus explicit
   ignores for contractions/possessives and the brief's own framing words ("owner", "suggests",
   "suspects", "ask"). Checked against `raw.txt`, not `clean.md`, per the owner's own wording. This
   dropped the flagged word count from 31 to 14 and cleared two asks (#3, #5) entirely.
2. **`node Server/refine.mjs --coverage-only <dir> [--mock]`** — rebuilds `coverage.md` (and
   `refine.json`'s `coverage` numbers) from a run dir's own `raw.txt`/`clean.md`/`brief.md`,
   without re-running `clean`/`structured`/`brief`. The classifier (uncited sentences only) is the
   one model call left, so a coverage-only fix like #1 above can refresh other run dirs without
   paying for the whole ladder again.

## Real fixes, proven on the real runs that found the bugs

- **`runs/b`** (a real `--collab` run) hit both the citation-range bug and the tie-break-by-price
  problem. After the fixes, `node Server/refine.mjs --coverage-only runs/b`: dropped 6 → 0 (the
  range bug was the entire cause — see below), flags 20 → 22, thin 5 → 7 (two of the
  now-correctly-cited sentences turned out to be genuinely thin once the mechanical check could
  see them at all), classify cost $0.0945.
- **`runs/c`** (121 sentences) is what the repair round exists for. Its ORIGINAL numbers (before
  either fix) were 23 dropped, 7 thin — mostly the range bug again, the same as `runs/b`: once
  `--repair-only runs/c` rebuilt coverage with the range fix already in place, the true starting
  point was 8 dropped, 24 thin (many of the 23 were really cited via a range; several of those
  turned out to be thin). One repair round on top of that: **9 new asks (#36-#44) + 10 amended
  asks, dropped 8 → 1, thin 24 → 5, cost $0.2566.** The one sentence still dropped (S95, "And we
  need to work on how that works") is a real, if small, gap — a genuine follow-up need that has no
  ask of its own yet; worth a second repair round or a manual add. `brief-v1.md` (35 asks) vs.
  `brief.md` (44 asks) is the diff.

## Costs measured

- `--mock` (plain, `--collab`, `--no-repair`, `--coverage-only`, `--repair-only`, and a fabricated
  thin-citation fixture proving the repair merge targets the actual problem ask, not just "the
  last one"): $0, proven throughout.
- The required real sample run: $0.4158 (above).
- The real `--coverage-only` re-run on `runs/sample` after the stemmer fix: $0 (nothing was
  uncited, so the classifier never ran).
- A fabricated real repair test (one dropped sentence, one Sonnet repair call): $0.0965 — dropped
  1 → 0, the new ask worded straight from the source sentence.
- `runs/b`'s real `--coverage-only` re-run: $0.0945.
- `runs/c`'s real `--repair-only` run: $0.2566 (one round, 19 asks touched).
- Ask-1's own check: $0 (read-only, no model calls).

## What's left, honestly

- `--collab`'s real (non-mock) path is wired, `--mock`-proven, and now also proven for real on
  `runs/b` (including the tie-break fallback path, which is exactly what that run hit) — no longer
  an open gap.
- The historical viewer question above (does `ai/v/3/prompts.js` read the dev-server fallback
  log too, or only Servex's own) — flagged, not chased down; ask-1 was scoped to 10 minutes.
- The repair round runs one Sonnet call with EVERY dropped/thin sentence in it at once; a run with
  a very large number of gaps (`runs/c`'s 23 dropped + 7 thin, in one call) is untested at a larger
  scale than that — if a future run has far more gaps than fit comfortably in one prompt,
  `--repair-rounds` already supports more than one pass, but nothing currently SPLITS one huge
  round into smaller batches automatically.
