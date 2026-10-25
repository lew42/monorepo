# Refine — speak one prompt and watch it refine (raw → clean → cards, with flags); plus a saved run shown as a ladder

**Prompt records (2026-10-23):** every owner prompt as parts with outcomes, and a computed completion; a prompt is complete when everything it asks is done or documented and no sentence was skipped. Live and review processes in `Server/PromptRecords.mjs`; shown on each session page's Coverage tab ([doc/prompt-records.md](doc/prompt-records.md)).

**Also here: the refine queue** — every past owner prompt becomes a refined card on its session page's Coverage tab ([doc/refine-queue.md](doc/refine-queue.md), `Server/RefineQueue.mjs`).

The page opens on a **live demo**: a mic/text box, the result, and beside it the live `Prompt` instance and its class card. Class doc: `doc/prompt.md`. Files: `RefineSystem.js` (the boss), `PromptRun.js` (data and completion, DOM-free; was `Prompt.js`), `PromptView.js` (its view), `Scorer.js`, `RefineDemo.js` (the demo view), `Prompt.css`; the server half is `Servex/ext/refine/run.js` (`POST /api/refine`).

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
- [Session log](/framework/ext/Refine/md/doc/session-log-2026-10-10/) — each prompt kept as raw, clean, refined and notes in the session's `prompts.jsonl` (`doc/session-log-2026-10-10.md`)
- [Tag notes](/framework/ext/Refine/md/doc/tag-notes-2026-10-12/) — a tagged prompt leaves a note on the module page its tag names, through the one Inbox (`Servex/ext/refine/TagRouter.js`, `doc/tag-notes-2026-10-12.md`)
- [Refine style](/framework/ext/Refine/md/doc/refine-style-2026-10-12/) — the one shared rule fragment (`RefineStyle.js`) every refine prompt uses, so refined prompts read as short, iconned, ordered overviews (`doc/refine-style-2026-10-12.md`)
- [Voice stages on the session page](/framework/ext/Refine/stages/readme.md) — raw, clean, structure, refined and cards drawn live on `/framework/ai/sessions/<id>/` as you speak or type (`stages/readme.md`, `stages/doc/voice-to-page.md`); try it on a phone: [`ux/Dictate/doc/try-it.md`](/framework/ux/Dictate/doc/try-it/)
- [Echo](../../../../Servex/doc/echo.md) — the running pipeline that uses this engine on every prompt you type in VS Code: triggers, output, cost, and the gaps against the vision (`Servex/doc/echo.md`)
- [Saved-run ladder](/framework/ext/Refine/ladder/) (was the page's Overview before the live demo took over) — run C live by default (the longest of the four runs, and the one with a dropped sentence AND a thin citation on its very first screen — `runs/sample` alone has neither); `?run=` picks any other run, including the small hand-built fixture
- `doc/vision-2026-10-08.md` — the owner's intended pipeline (raw → clean → refined cards, every sentence accounted, context cards); check the built state against it
- `doc/raw-match.md` — the word-overlap heuristic that lights up Raw, worked example
- `Server/doc/refine.md` — what `refine.mjs` writes, and why each file looks the way it does
- `doc/refine-engine.md` — `engine.js`'s `clean()` and `structure.js`'s `structure()`: the shared, two-speed clean step Dictate and the prompt-log processor both call, its mechanical glossary/strike/diff-check rules, and the 3-model litmus test that picked the cheap model to run it on
- Open work: [loose ends by system](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/by-system.md) — unbuilt Refine stages (context cards, interactive request cards, handoff, request filing) with the smallest fix per row; source rows in `/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/loose-ends.jsonl`; the ten `now` transcription rows, checked: [loose-ends.md](/framework/ai/sessions/2026/10/12/session-0e99727c/voice-to-session-page/loose-ends.md)
- [Confidence scale](/framework/ext/Refine/md/doc/confidence/) — 0.5 = not sure, over 0.7 needs evidence (`doc/confidence.md`); [past days refined, in reverse](/framework/ext/Refine/runs/) (`Server/refine-days.mjs`, input capped at 20k characters a day, so each day is a sample).

- **Hears the ✦ chat** — `VoiceFollow.js` watches this tab's voice session (`lew42-voice-session`) and shows the owner's dictated lines on the demo as the raw text, so the ✦ chat (phone sheet or desktop drawer, same tab) and this page agree. Its own composer mic is the shared `ComposerMic`. Proof: `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/mic-proof.mjs`.
- **Task home** (the owner's 2026-10-16 dictation as six ranked subtasks, first one started): [tasks/refine-dictation-to-cards-and-tasks/readme.md](tasks/refine-dictation-to-cards-and-tasks/readme.md).
