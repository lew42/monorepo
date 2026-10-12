# Live refine — the outline grows while you talk (design, 2026-10-12)

**What it is:** while the owner dictates, each finished sentence is placed into the refined outline within a few seconds, instead of one big refine after they press a button. A sentence that clarifies an earlier point **amends that point**; a new topic gets a new section. Every sentence stays cited, so nothing said is lost.

Asked in [refine-haiku-live](/framework/ai/2026-10-12/refine-haiku-live/requirements.md) §3. Runs on Haiku (`RefineCall.model()`, see [ai/doc/models.md](/framework/ai/doc/models.md)).

## The classes

```
LiveRefine            Servex/ext/refine/LiveRefine.js   one per prompt being dictated: holds the slots and the outline, runs clean + amend
 ├ RefineCall          (exists)  one Haiku call, its own fresh session
 ├ clean()             (exists)  engine.js, near-verbatim clean, checked by code
 ├ Outline             (exists)  ext/Refine/Outline.js, md <-> {subject, sections}
 └ VoicePage           (exists)  writes each stage onto the session page (streamed)
RefineSystem.live()   ext/Refine/RefineSystem.js        the browser half: posts the raw text so far, applies the answer
ComposerMic           ext/Chat/Mic.js                   every mic: raw in the box, clean in the bubble, live() underneath
```

`LiveRefine` is the orchestrator for one prompt; `RefineSystem` stays the browser boss.

## The flow, one sentence at a time

1. **Slots.** The browser posts the whole raw text so far (`POST /api/refine/live`). `quick_clean()` (mechanical, ~1 ms) splits it into sentences. Every *finished* sentence beyond the ones already taken becomes a **slot** with a fixed number `S<n>` (the last one waits until a later sentence or `final: true` closes it). Numbers never change, so citations stay valid.
2. **Two calls in parallel, per batch of new slots:**
   - **clean** each new slot (Haiku `clean()` with the previous slot as context); the slot's display text becomes the cleaned text when it returns. The chat bubble shows these, paragraphed.
   - **amend** the outline (one Haiku call, below). It works from the mechanical text and cites by number, so it does not wait for clean.
3. **One amend at a time.** Slots that arrive while an amend is in flight queue up and go together in the next one (coalescing), so a fast talker costs fewer calls, never a backlog.
4. **Write.** After each amend: the outline (as markdown) goes onto the session page's Structure/Refined stages through `VoicePage`, and the POST answers with the current state. On `final: true`, the queue drains, the prompt is logged (`PromptLog`, like `run_refine`) and the page marked done.

## The amend call: operations, not a rewrite

The model gets the current outline **with ids** and the new numbered sentences, and answers JSON operations only:

```
# 🧩 Refine
## 🎙️ Live refinement
- [c3] ⬜ Refine runs while you talk [S4, S5]

New: S9: Actually it should wait for a full sentence first.
```
```json
{"subject": null,
 "ops": [{"edit": {"id": "c3", "text": "⬜ Refine runs while you talk, one full sentence at a time", "cites": [9]}},
         {"add":  {"section": "⚙️ Settings", "text": "...", "cites": [10]}}]}
```

- `edit` — the new sentence clarifies, corrects or adds detail to point `cN`: rewrite that point; its cites become old ∪ new.
- `add` — a new point under an existing section title, or a new section (title with one emoji icon, `RefineStyle.RULES`).
- `subject` — a new `#` title only when the topic has truly changed, else `null`.

**Checked by code, never trusted:** unknown ids become `add`s; every new sentence cited nowhere is added under its last-used section and flagged `unplaced`; cites only ever grow. So coverage (every sentence cited at least once) holds by construction.

**Why operations:** the answer stays a few dozen tokens however long the outline gets, so latency per sentence stays flat; a full rewrite grows with the outline and can silently drop a point. Alternative kept in reserve: full rewrite with `structure()`'s exactly-once check (simpler prompt, slower and riskier as it grows).

## Staying under 100k tokens

Every call is its own fresh session (`RefineCall`), seeded with the current outline: that is the "fresh session with the refined prompt as its seed" rule, applied every turn, so nothing accumulates. The outline sent is capped (`LiveRefine.BUDGET_TOKENS = 60000`, chars ÷ 4): over it, bullets are sent as id + first 80 characters. Each call records its tokens; the measurement below reports tokens per turn.

## Measured

`Servex/ext/refine/test/live-refine-measure.mjs` replays a long real dictation sentence by sentence at speaking pace and writes `results.jsonl` + `summary.md` in the task folder: per batch, sentences, clean ms, amend ms, arrival → placed ms, tokens in/out, cost. Results: [refine-haiku-live/measure/summary.md](/framework/ai/2026-10-12/refine-haiku-live/measure/summary.md).

## Next to try

Recorded in the measurement's summary once real numbers exist (e.g. a resumed Haiku session to use the prompt cache, or clean + amend in one call).
