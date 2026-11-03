# Check 23 asks against the repo: ext/Refine

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/23-ext-refine-2/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ext/Refine`, folder `public/framework/ext/Refine` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ext/readme.md`, `public/framework/ext/Refine/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ext/Refine/readme.md`)

# Refine — speak one prompt and watch it refine (raw → clean → cards, with flags); plus a saved run shown as a ladder

**Also here: the refine queue** — every past owner prompt becomes a refined card on its session page's Coverage tab ([doc/refine-queue.md](doc/refine-queue.md), `Server/RefineQueue.mjs`).

The page opens on a **live demo**: a mic/text box, the result, and beside it the live `Prompt` instance and its class card. Class doc: `doc/prompt.md`. Files: `RefineSystem.js` (the boss), `Prompt.js` (data + view), `Scorer.js`, `RefineDemo.js` (the demo view), `Prompt.css`; the server half is `Servex/ext/refine/run.js` (`POST /api/refine`).

`refine()` fetches one run of `Server/refine.mjs` (dev-only — see `Server/doc/refine.md`) and lays it out as four columns side by side: what was said, then each refinement step. Click an ask, or a bullet in Structured, and its source sentences light up in Clean and Raw — "wait, what did I actually say?" answered without reading anything twice.

## Use
```js
import refine from "/framework/ext/Refine/Refine.js";
refine(import.meta, { run: "/framework/ai/sessions/2026/09/29/a918d03d-6afe-4958-b425-20e9eba998ef/prompt-refine/runs/b/" });
```
A `runs` list — `[{ id, label, dir }, …]` — draws a picker (`<select>`) above the ladder and makes this view **own** `?run=` in the url, the same one-owner rule [`ext/files`](/framework/ext/files/) uses for `?file=`: a reload lands back on the same run. The card at `2026/09/29/from-dictation-to-a-brief-with-nothing-l` (on the AI 2 dashboard) uses this for its sample/a/b/c picker.

**A second, smaller piece lives here too: `prompt-card.js`.** It is the Condensed →
Structured → Clean → Raw mode switch a single logged prompt gets on a card — not the
four-column ladder above, just one prompt's own four readings, reused wherever a prompt
needs a card: `ai/v/3/prompts.js`'s live thread, and `ai2`'s pinned "Your prompts" card
(`ai2/faces.js`'s `prompt_timeline()`). It lives here, not inside either of those pages,
because `ai2/inbox.js` deliberately never imports from `ai/v/3` (that board is being
replaced) — this is the neutral ground both share, same reason `ext/Mention` is.
```js
import { prompt_modes } from "/framework/ext/Refine/prompt-card.js";
prompt_modes({ raw, sentences, structured, fallback_text });   // see its own doc comment for the full shape
```

## Watch out
- **Three widths, not two.** 1600px+: four full columns. 640–1599px: three — Raw and Clean share one, with their own mini tab strip (four columns squeezed a real run's Raw and Clean down to a few words a line as low as 1280px). Under 640px: the original stacked four-way tabs.
- **The "Dropped & flagged" strip, right under the one-line count**, is a shortcut into the full coverage table below — every dropped or "(thin)" sentence, one row per flagged ask (anchored on its first cited sentence, not one row per sentence in a big range). Click a row the same as an ask or a bullet.
- **A citation is a comma list ("[S3, S7]") or a range ("[S6-S9]")** — `Server/refine.mjs` writes whichever shape it lands on per run; `parse_cites()` accepts both, expanding a range to every sentence in it for the highlight while keeping its written form for display. Cost a real bug: run B and C's citations are mostly ranges, and the first version only understood commas, so clicking almost any ask on those two runs highlighted nothing.
- **The raw → clean highlight is a heuristic, not a citation the tool wrote.** `clean.md` numbers its own sentences; `raw.txt` doesn't. The matching stretch in Raw is found by word overlap between each clean sentence and Raw's own sentences — see `doc/raw-match.md` for the worked example and where it could be wrong.
- **A run missing a file shows what it has, and says what's missing**, instead of breaking — useful while `Server/refine.mjs` is still landing its later steps (`--collab`, `refine.json`).
- **`refine-` is a new CSS class prefix**, not yet in `styles/css-scopes.txt` — that file was outside this module's fence, the same as `ask-`'s precedent (see the file's own comment there). The mastermind registers it.
- **Dropped rows are warm (`--warn`), never `--error`/`--hot`.** A dropped sentence is worth a look, not a failure — the owner's rule for the whole view.

## Architectural Recommendations
1. **The ladder view as a class (`class Refine extends View`):** `Refine.js` is still a functional factory (the live demo is already classes: `RefineSystem`, `Prompt`, `RefineDemo`). A class gives it `ext/Doc` method tabs.
2. **Server-Side Grouped Outline Emission:** `Server/refine.mjs` prompt specifies `## Subheading` markers, but models occasionally drop headers under token pressure. Enforce markdown header AST parsing or synthetic topic clustering to guarantee hierarchical trees rather than flat bullet lists.
3. **Dropped & Flagged Drawer:** Elevate the strip into a collapsable sidebar drawer with one-click sentence filter toggles.

## Try it
[Try it](/framework/ext/Refine/try/) runs the real `clean()` step (same one Echo runs) against any
model: every local gguf file this machine has, a few cheap OpenRouter models, and Haiku — paste
rough text, pick a model, see the cleaned result, its time and its real $ cost. "Run all" compares
every model on one piece of text at once. A small growing test set lives beside it
(`fixture/clean-examples.jsonl`, 2026-10-04) — save a good (or bad) clean result and "Score all
models" ranks every model by a plain word-overlap % against the saved answer. Not built yet:
pulling a sample straight from a recent voice session — no index of raw dictation lines exists
today, so paste is the stand-in; see the page's own doc comment (`try/page.js`) for why.

## More
- [Card types and the task lifecycle](doc/card-types.md) — the owner's vocabulary, dictated 2026-10-16: every card type a prompt refines into (question ¿, request, requirement, directive, task, proposal, decision…), the must / should / could certainty scale, plan → proposal → approve / improve / reject → task; decisions as ranked lists of options, purpose and weight as card aspects, interactive cards, context cards, `ext/Mention` referencing; the `Item`, `Page`, `Task`, `Proposal` class notes (`doc/card-types.md`)
- [Redesign slice, built 2026-10-16](doc/redesign.md) — every sentence kept as a chunk in `RefineSystem.chunks`, the composer's `per_sentence` option, compact `Prompt.View`; proof `test/composer-flow.mjs` (fake mic, needs Whisper `:8178` and Servex; capped at 6 refine calls and 90 s per run, `MAX_REFINE_CALLS` / `MAX_SECONDS`, because each call is a real Haiku session): `PWENTRY=<playwright/index.mjs> node test/composer-flow.mjs <base-url>`
- [Audit 2026-10-15](doc/audit-2026-10-15.md) — the owner's rules checked against the code (present / partial / missing), why a first sentence vanished, the S1. leak and the clipped box, 400 px screenshots; and [the redesign proposal](doc/redesign.md): one compact page, raw then clean then refined (`doc/audit-2026-10-15.md`, `doc/redesign.md`)
- [Placement](doc/placement.md) — after the Cleaner, each sentence appends to the previous paragraph or starts a new one (`Placement.js`, rules first, unsure means append)
- [Cleaner](/framework/ext/Refine/cleaner/) — the class that cleans a chunk (`Cleaner.js`): instant `quick_clean`, model `clean`, live demo with its instance; `engine.js` keeps the old function names
- [How it works](doc/how-it-works.md) — the classes, the two steps (clean, then refine), how Dictate feeds it, and what is known broken
- [Voice to refine (proposal)](doc/voice-to-refine.md) — a long dictated prompt through the voice tunnel, refined onto `/live/`; a proposal, nothing built
- [Refined asks](doc/asks.md) — each refined ask becomes a line in its session's `asks.jsonl`, a per-module `doc/refined-asks.md`, and (if not done) a module inbox line (`Server/AskIndex.mjs`)
- [Refine queue](doc/refine-queue.md) — the owner's past prompts refined one per Haiku call, N at once (`Server/RefineQueue.mjs`), as `refined` cards (`RefinedCard.js`) on each session page's Coverage tab; the Opus review that picked brief v2; the promotion rule for asks said in 3+ sessions (`doc/refine-queue.md`)
- [`doc/notes.md`](./doc/notes.md) — design, implementation, and API notes for `engine.js`
- [Refine v3](/framework/ext/Refine/md/doc/refine-v3-2026-10-09/) — the one-screen workspace, instant clean, a session per model run, per-sentence clarity, numbers (`doc/refine-v3-2026-10-09.md`). The old saved-run ladder moved to `ladder/`.
- [audio/Whisper](/framework/audio/Whisper/) — the Whisper server and per-surface session classes (`Whisper`, `WhisperSession`)
- [Architecture](/framework/ext/Refine/md/doc/architecture/) — the classes, the boss (`RefineSystem`), what composes what (`doc/architecture.md`)
- [Nothing to refine yet](/framework/ext/Refine/md/doc/nothing-to-refine-2026-10-09/) — the mic-input bug and its test (`doc/nothing-to-refine-2026-10-09.md`)
- [Whisper flow](/framework/ext/Refine/md/doc/whisper-flow-2026-10-09/) — measured: Whisper did not fail; the errors were a page bug. Recommendation: keep local Whisper (`doc/whisper-flow-2026-10-09.md`)
- **The demo's dictation** is `ux/Dictate` (the same engine the voice chat's `ux/Dictate/Widget` wraps in its chat card; one engine, no second copy). Its controls sit in a fixed toolbar, and [`ux/Dictate/VoiceStrip`](/framework/ux/Dictate/md/doc/voice-architecture/) (its `Connection` row) draws the Mic → Level → Whisper → Transcript → Refine row (Whisper asked once on load, again only on the ↻ click). Proof: `test/dictate-flow.mjs`
- [ErrorLog](/framework/ext/ErrorLog/) — UI errors become a log line a session can follow; design in `ErrorLog/doc/design.md`
- [Prompt](/framework/ext/Refine/md/doc/prompt/) — the class: what it holds, how scores are computed, what is not built yet (`doc/prompt.md`)

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/23-ext-refine-2/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 23 asks

1. `5a0edfd81d` (3 days old): Enlarge group headings on index pages so they stay readable when zoomed far out, keeping the tiny zoomed-out look.
2. `3042912002` (3 days old): Upgrade the refined prompt so each sentence moves up into it.
3. `de7962203f` (3 days old): As the first refine step, identify referenceable things and create context links for them.
4. `ee621a5200` (3 days old): Show each mentioned referenceable thing as a pill, so three mentions give three pills.
5. `9ade6e74a0` (3 days old): Once context is on screen, work out the symbology or flowchart layout that shows how things connect.
6. `62581f577b` (3 days old): Expand the pill frame (padding, icon, name) into a context card that can hold extra rows of other kinds such as log, message, request, or question.
7. `802fe5d5c7` (3 days old): Make context cards linkable with a launch arrow to a custom view about the topic, like a quote block.
8. `4f3fac829c` (3 days old): Document the context cards.
9. `6e25c23cc6` (3 days old): Run refinement, structure and card creation in real time, per chunk.
10. `54ca04e286` (3 days old): Run prompt refinement on past sessions, day by day in reverse, from verbatim prompts to refined directive to outcome.
11. `9fa8a6d799` (3 days old): Each refinement reports confidence separately for how clear the ask is and how clear the outcome is.
12. `b23f40af8e` (3 days old): Consider a confidence weight that defaults to 0.5 (or 1 as a multiplier), lowered when unsure and raised when sure.
13. `173438a890` (3 days old): Make the meaning of the confidence weights explicit so nobody mistakes them, e.g.
14. `9d33de5fb3` (3 days old): Test all of these refinement and confidence changes.
15. `e2a605ec78` (3 days old): Run prompt refinement on past sessions, day by day in reverse.
16. `2620965dfd` (3 days old): Layer each prompt: verbatim, then what was needed, then the outcome.
17. `9042f3bfcd` (3 days old): Score each prompt for clarity of the ask and clarity of the outcome, with confidence.
18. `86bcfdcf2f` (3 days old): Maybe pick a neutral start value, 0.5 or 1 as a multiplier, with confidence moving it up or down.
19. `24c1c1f391` (3 days old): Make the meaning of weights explicit so no one misreads 0.9.
20. `a5ae9d9a03` (3 days old): Re-check existing confidence weights, since many do not match the owner's judgement.
21. `b9ec96eb3a` (3 days old): Test these ideas.
22. `79977cb76c` (3 days old): Make prompt refinement output JSON streamed to the UI, not markdown
23. `6df15ff89d` (3 days old): Use the refined prompt as the handoff source of truth, with deltas rather than snapshots
