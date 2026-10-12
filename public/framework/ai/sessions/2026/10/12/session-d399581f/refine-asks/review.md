verdict: fix
1. [fix] Pressing Refine twice does not refresh the same stages, which is what the doc comment promises: `AISessionConversation.js:172` builds the prompt id from `Number(at)`, but `at` is the transcript's ISO `timestamp` string (`AISessionConversation.read`), so `Number()` gives NaN and every press falls back to `Date.now()`, making a new id and a new copy of the stages. Use `Date.parse(at)` instead.
2. [note] Long prompts fail by design: `/api/refine` accepts 64 kB of JSON, and a bubble that joins many pieces (`Chat.js:256`) goes over the 20k-character limit STATE mentions. The proof only passed after `TRUNC=1` cut the text to 300 characters (`button-proof.mjs:69`), so the real button was never shown working on a full long prompt. The error does appear on the button, but trimming the text, or saying on the button that it is too long, would be kinder.
3. [note] `ThingsStage.views` (`ThingsStage.js:377`, filled in `render()`) only ever grows: every stage view drawn on a page stays referenced after it is gone. This is small, but a `loading.then(() => this.draw())` inside `render()` would do the same job without the Set.
4. [note] `ThingsStage` matches against `maps["#"]` once, when `things.json` loads (`ThingsStage.js:380`). A `#` name registered after that will not be matched until the page reloads. This is fine if the Mention maps are filled at import time, which they appear to be.
5. [note] `VoiceStage.js:8` still says "The five: RawStage → … CardsStage" in its doc comment. The readme and `voice-to-page.md` were updated to six stages; this comment was missed.
6. [note] The proofs and `STATE.md` are only in the diff; this review had no screenshots, so it checks the code only (no widths given). `things-proof-*.png` exist for 400/1200/1920/3440 in the diff.

## Requirements
- 1 "Each open point is built (with a commit), or written up in STATE.md with the real blocker and the smallest next step" — yes — STATE.md lists 3 built (with commits), 4 already built, and 5 not built, each with a reason and a next step.
- 2 "Proof per point: a headless check, a screenshot, or a command's output. Layout-check 400/1200/1920/3440" — partly — `things-proof.mjs` covers four widths; the button proof only ran on 300 truncated characters, against overridden files (finding 2).
- 3 "The entries in ai/doc/asks.md are updated (done / partly / open) with commit links" — yes — #7 and #10 now have Done and Open lines with commit hashes and a STATE link.
- "Check each point against the code: one already built is ticked with file:line proof" — partly — the "Already built" items name files but not file:line.
- "Never destructive" — yes — the diff only adds code and edits docs.
## Words
- content — yes — STATE and the asks.md entries are plain sentences that lead with the outcome. The asks.md #7 and #10 entries are long single lines, but that matches the file's existing shape.
- STATE.md "Opus voice overseer" row — note — it quotes the owner as "Haiku cleans, never runs the show", which explains why Haiku is not the overseer, not why the Opus overseer was declined. The asks.md #10 line repeats this wording ("the owner said Haiku never runs the show").
