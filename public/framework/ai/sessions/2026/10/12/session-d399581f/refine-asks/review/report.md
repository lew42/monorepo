verdict: fix
1. [fix] The brief asks for asks.md entries "updated … with commit links", but #7 and #10 cite the commits as plain inline code (`12d9e9fb5`, `b1a8f8092`, `0fd19d684`), not links (requirements "Done when" 3; CLAUDE.md "Link every mention") — diff, ai/doc/asks.md lines 7 and 10.
2. [note] The given shots are 23 task and day pages whose `page.jsonl` only gained `{"file":…,"gone":true}` census lines from a merged branch; none shows this task's UI. The changed surfaces (the session page's Refine button, the Things stage, the card meters) are judged from the task's own proofs in the worktree: `button-proof.png`, `things-proof-{400,1920}.png`, `cards-meters.png`.
3. [note] `button-proof.png` captures the button mid-flight ("Refining…"), not the "Refined ✓" state or the stages drawn under the prompt, so the end of the flow is claimed in STATE.md but not shown.
4. [note] The reason given for not building the Opus voice overseer misquotes the owner. asks.md #10 says "the owner said Haiku never runs the show", but that quote is about Haiku, not Opus (content: say what you mean).
5. [note] Each "Things you mentioned" link is a full-width black bar. At 1920 a one-word name (`Dictate`) stretches about 900 px, so five bars outweigh the words you said (things-proof-1920.png, top prompt, right column).
6. [note] The importance and confidence bars carry no number; the value is in a hover `title` only. The 0.75em grey labels are faint (cards-meters.png).

Widths given: 400, 1200, 1920 and 3440 for each of 23 unrelated pages; this task's proofs are at 400, 1200 (button) and 1920.

## Requirements
- 1 "Each open point is built (with a commit), or written up in STATE.md with the real blocker and the smallest next step" — yes — STATE.md: three points built with commits (12d9e9fb5, 0fd19d684, b1a8f8092), four already built with file proof, four not built, each with a reason and a next step
- 2 "Proof per point … Layout-check 400/1200/1920/3440 for any page change; smoke clean" — partly — the Things stage is shot at all four widths (things-proof-*.png); the Refine button only at 1200, mid-flight; the meters as one crop; no smoke result is in the diff
- 3 "The entries in ai/doc/asks.md are updated (done / partly / open) with commit links" — no — #7 and #10 are updated with Done/Open, but the commits are not links (finding 1)
- "Check each point against the code: one already built is ticked with file:line proof" — partly — STATE.md "Already built" names files (`VoicePage.js`, `run.js`, `TagRouter.js`) but gives no line numbers
- "Never destructive … worktree; commit each step" — yes — the work is on worktree/refine-asks with one commit per step; the diff only adds code
## Page structure
- page 1 (title says what it is) — yes — things-proof-400.png: the "Hearing you" box and the "Things you mentioned" heading
- the rest of the section — n/a
## Navigation
- navigation 1 (identify) — a selected chat bubble grows an inline button (`Refine ✦`); link rows go to module pages
- links look like links — yes — the Things rows are Mention rows (`build_row`), the same as other mentions
- the rest of the section — n/a
## Layout
- the stages sit side by side when wide and stack when narrow — yes — things-proof-1920.png shows four columns; things-proof-400.png is one column
- the Things column's width fits what it holds — no (note) — things-proof-1920.png, top prompt: the bars run about 900 px for one word (finding 5)
## Sizing
- the meter bars have a bounded size — yes — `.voice-bar { flex: 0 1 8em }`; cards-meters.png
- nothing overflows sideways — yes — STATE.md: no overflow at four widths; things-proof-400.png fits in 400 px
## Wrapping
- the quoted sentence wraps cleanly under its link — yes — things-proof-400.png: `overflow-wrap: anywhere`, `flex: 1 1 14em`
- the button label wraps — n/a — measured: not measured; button-proof.png keeps it on one line
## Spacing and padding
- gaps between the Things rows are even — yes — things-proof-400.png: `.voice-things` uses gap .3em
- the meter rows fit the card's rhythm — yes — cards-meters.png
## Colour and contrast
- the text has enough contrast — yes, with one weak spot — the Things bars are white on black; the meter labels are small and grey (finding 6)
- the importance and confidence fill can be told apart from their track — yes — cards-meters.png: the fill is 55% currentColor on a 12% track
## Flow
- the stages read in the order they happen — yes — Heard, Things you mentioned, then Clean and Cards (things-proof-1920.png, lower prompt)
- the stage numbering is consistent — no (note) — "Things you mentioned" has no number between "1 · Heard" and "2 · Clean"
## Words
- the labels are plain words — yes — "Refine ✦", "Refining…", "Refined ✓", "Things you mentioned", "importance", "confidence"
- an error explains itself — yes — "Refine failed: <why>" on the button
- the claims are accurate — no (note) — the Opus overseer reason misquotes the owner (finding 4)
- the readme and doc are updated — yes — `stages/readme.md` and `doc/voice-to-page.md` name the six stages and `ThingsIndex.mjs`
