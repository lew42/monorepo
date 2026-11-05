verdict: pass
1. [note] Ask 1's "the single most relevant direct answer comes first" (owner-notes-2026-11-01-2040.md item 17) is met only for agent updates held while `cue_pending`; two "smart" replies, or an update queued before the owner's line, still play in arrival order. The readme's No flood paragraph says so plainly, so it is a known limit, not a hidden one.
2. [note] The spoken line promises "tap to hear it", but a tap only pauses or resumes what is already playing. The readme, architecture.md and Open item 1 (Resumable bubbles) all say this; the next agent's piece makes it true.
3. [note] The demo band is 1.30 screens tall at 400 (layout.json `bands[1].share 1.302`), because the sample text appears twice: once in the textarea and again in the new bubble. The builder declined this with a reason: the bubble's text must match what is being read, or the highlight demo breaks. The reason holds, so it stays a note.
4. [note] The paused-bubble shot reads `0:00 / 0:00` in the bar while the first word is lit and the Play button shows ▶ (shots/tap-to-pause-400.png and -1200.png, the bar band). The paused state shows, but the time readout does not, so the shot proves "paused" less clearly than it could.

Widths given: 400 and 1920 (shots/127-0-0-1-55734-framework-audio-Recite/), plus the builder's own paused shots at 400 and 1200.

## Requirements
- 1 "a 2–3 s quiet window before a queued reply plays" — yes — `Recite.turn_wait_ms` and `BargeIn.quiet_ms` are both 2500 (diff, Recite.js:46, BargeIn.js:30); `check_wait()`'s fallback is 2500 too
- 1 "the reply that answers the owner's latest line plays first" — yes, for held updates — test "an agent update collapses to one line and queues behind the direct answer" and "a held update waits for the whole stream to end"; scope limit in note 1
- 1 "an agent update collapses into one spoken line ('I have an update on X, tap to hear it')" — yes — `agent_update()` with `Recite.AGENT_ID`; `fast`/`revise`/`card` are still ignored (their own test); the safety release after 4 s is tested
- 2 "tapping a bubble plays or pauses it" — yes — `ReciteTap.click()` calls `recite.toggle()`; test "Recite.Tap: tapping a chat bubble plays or pauses"; shots/tap-to-pause-400.png, the bubble with "Here" lit
- 2 "taps on links, mention chips and buttons are ignored" — yes — `ReciteTap.IGNORE` plus `ReciteHighlight.SKIP`; the same test covers each of the three, and a separate test covers a drag that leaves a selection
- Proof: "Recite.test.mjs passes with new cases for both items" — yes — session.jsonl records 30/30, with 7 new cases in the diff
- Proof: "headless shots at 400 and 1200 px of a paused bubble" — yes — shots/tap-to-pause-400.png, shots/tap-to-pause-1200.png (see note 4)
- Proof: "smoke.mjs on Recite and Dictate shows no FAIL" — yes — session.jsonl: "0 FAIL across 535 lines"
- "Update the Recite readme's Open list and doc/architecture.md" — yes — items 1–2 are removed from Open and the rest renumbered; architecture.md has the No flood pieces 1–2 and Tap to pause; the 1.5 s mentions are now 2.5 s
- "Items 3–5 stay on the Open list" — yes — they are now Open items 1–3, plus the Dictate gate item
- "never edit ux/Dictate/chat.js" — yes — the diff does not touch it
- Class page: can you open a page that shows `ReciteTap`'s live instances? — yes — `track(ReciteTap)` plus `this.constructor.track(this)`; it holds only a `recite` reference, no state worth watching
- Docs and index — yes — the readme's class list and Files list name ReciteTap.js; the Use section describes the tap; a grep of the worktree finds no stale `turn_wait_ms`/`schedule_cue`/"any assistant" wording outside Recite; the task folder is indexed in dictation-v3's session.jsonl
- A fresh agent can continue from this folder — yes — requirements.md, session.jsonl (29 lines, the last one is the review answer), review.jsonl, and the readme's renumbered Open list name the next piece
## Page structure
- page 1 (title says what it is) — yes — shots/…/1920.png, top band: "Recite" under the audio tabs
- demo first, shown not told — yes — the demo band comes right after the title at both widths (layout.json bands[1])
- one takeaway per demo — yes — the caption "Press Read it aloud, then tap the bubble below…" states it
## Navigation
- identify — tabs, a sidebar (1920), a bottom rail (400)
- tabs on one row — yes — layout.json tab_rows 1 at 400 and at 1920
- current page marked — yes — the RECITE tab is underlined and the sidebar row is lit (sheet.png)
- this diff adds no navigation — n/a
## Layout
- the new bubble sits in the demo's flow, full content width — yes — shots/tap-to-pause-1200.png, middle band
- overflow_x — yes, none — layout.json overflow_x false at both widths
## Sizing
- demo band share — no (note 3) — 1.302 at 400, 1.041 at 1920
- the bubble's measure — yes — widest_text 1123 at 1920 sits inside the demo screen; the line length in tap-to-pause-1200.png reads fine
## Wrapping
- unwanted wraps in the diff's UI — no — only `drawer-rail-ai`/`drawer-rail-menu` at 3.2 lines (layout.json wraps, 400), which are older and are the rail's stacked icon buttons; the caption wraps to 3 lines at 400, which is normal for prose
## Spacing and padding
- bubble padding — yes — 0.6em 0.9em, with clear inner space in shots/tap-to-pause-400.png
- gap between the caption and the bubble — yes — one flow gap (tap-to-pause-1200.png)
- left_stack — yes — p at 49 px at 400 and 87 px at 1920, from the existing demo and page layers; nothing new added
## Colour and contrast
- bubble surface — yes — `var(--wash)`, a token, visibly set off from the checkered demo ground
- muted caption readable — yes — tap-to-pause-1200.png, grey on light, legible
- highlight on the bubble — yes — the "Here" word wash shows in both paused shots
## Flow
- the reading order explains the demo — yes — textarea → Read it aloud → bar → caption → bubble
- the prose card below still matches the demo — partly — it does not mention the bubble, but the caption above covers it (note 3)
## Words
- caption plain and short — yes — one sentence that names the gesture and its equal on the bar
- readme No flood paragraph clear to a new reader — yes — it says what counts as an update, what plays first and what is not true yet
- the spoken line — yes — the owner's own wording, "I have an update on X, tap to hear it"
- jargon — yes, none new — `cue_pending`/`AGENT_ID` appear only in architecture.md, the detail doc
