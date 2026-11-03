# Check 23 asks against the repo: ext/Refine

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/22-ext-refine-1/results.json` and stop.

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

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/22-ext-refine-1/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 23 asks

1. `7c99d3dafc` (8 days old): Build a class architecture view on the refine page showing how the prompt, refine and related classes fit together, with their names
2. `93876d47b5` (8 days old): Consider a Prompt class as a simple data structure
3. `0c1a95902e` (4 days old): Use a single consistent preview scale or a scale chosen per filter width so grid items fit with labels
4. `df617c6420` (4 days old): Find or build a masonry layout for preview grids so mismatched heights pack neatly
5. `ba39e5b3bb` (4 days old): Consider grid with per-item column span and row span as an alternative to masonry
6. `637b56292b` (4 days old): Decide how base updates propagate to extensions
7. `e1d3f32ba2` (4 days old): Keep Open Router usage to a minimum by preferring Claude tokens already paid for
8. `99fdb12b0d` (4 days old): Find or build a switch (file identifier) that moves all processing to Open Router and back
9. `eb2e1bd756` (4 days old): Fall back to Open Router when Claude tokens run out
10. `83ea0cf790` (4 days old): Use Haiku for clean transcription and refined prompt work
11. `75617b4b8f` (4 days old): Make refinement real-time, processing cleaned sentences as they arrive
12. `76cf20cdd0` (4 days old): Amend the refined prompt incrementally as detail is added
13. `a9fddccc0d` (4 days old): Add cleaned sentences into the existing structure rather than a wall of text, so everything is tracked
14. `c42e88e2b7` (4 days old): Get a basic working refinement first, then iterate
15. `0765b179a6` (4 days old): How to get real-time incremental refinement working
16. `12dc839c7e` (4 days old): Harmonize framework sidebars with the site UI system
17. `475575f733` (4 days old): Harmonize the framework sidebars with the site's sidebars, which look very similar.
18. `793754b63d` (4 days old): Make the Miller columns more compact, since their list items have two lines of text and too much spacing
19. `c0eca69ee6` (4 days old): Build a tree UI with icons from the Google material icons library
20. `cf587f442a` (4 days old): Explore list UI styles, especially a tree of layers, made mobile friendly
21. `700297c608` (4 days old): Put the layer tree in a small mobile sheet, where selecting an item selects it on the screen above in a split-screen workflow
22. `328d10384f` (3 days old): Check whether the web offers better equal-height equalization for cards.
23. `ad433b0ac9` (3 days old): Wrap each group on the full-size index page in a wrapper, possibly black at 10% opacity.
