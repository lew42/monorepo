verdict: fix
1. [fix] No shot of any new variant: shots/ holds only `/framework/ui/card/` (sheet.png, 400/1200/1920/3440), which shows the old top specimen, not `titled`, `stack`, `tree-rows`, `fit`. The brief asked for `?at=ui/card/tree-rows` at 400 and 1200 and `fit` at 3440 (Requirements A, check). Layout, sizing, wrapping and spacing for the new work are unverified.
2. [fix] The two urls from the ArrowDown key test are not in the task folder. The brief (B) asked for them in the log, and `session.jsonl` has no `location.search` pair. No Library test or script was added either, so nothing proves the keys work.
3. [fix] `ui/card/page.js` (the `## Four variants, not six` heading, line ~129) is stale: the page now has nine variants. `ui/card/doc/architecture.md:24` ("Decided: linked, media, action and list…") still names `list`, which was renamed `compact`. The `/framework/ui/card/list/` url now 404s, and old audit data links to it.
4. [fix] `ux/Inbox/readme.md:30-31` still presents `.flush-stack` as the Inbox's own rule. It moved to `framework.css` (`util` layer), so the readme must say where it lives and that `ui/card`'s `stack` also uses it. `styles/` has no index line for the class either.
5. [fix] A fresh agent cannot continue from the task folder alone: there is no outcome and no commit list. `session.jsonl` ends with a harness-completed close ("agent ended its turn without completing"), the smoke run result is absent, and the "ui-kit gap" line found (`/live/demos/page.jsonl` bare-string line) has no follow-up task. The extra loose pngs in shots/ (framework-1920, framework-library-1920, framework-ux-Inbox-1920, framework-ui-card-1920) belong to no named question and are unindexed.
6. [note] `fit` is `.measure.start` with an inline `--measure: 22em`, and `titled` sets font sizes inline. The brief allowed this only "beyond what the existing variants already do". Both carry notes, so it is acceptable, but it is a second inline-style pattern for the kit.
7. [note] The `keydown` listener is added once and never removed (`this.listening` guard), and the key map moves the rail with wrap-around. Wrap-around was not in the brief; harmless, but say so in the library readme.

## Requirements
- A1 "six variants as demo.page" — yes — diff adds titled, stack, tree-rows, compact (renamed list), large, fit (page.js)
- A "no page CSS" — yes — no new `<style>` or .css file; the one CSS move is flush-stack into framework.css's util layer, stated in `stack`'s note
- A "check: shots of tree-rows at 400 and 1200, fit at 3440" — no — shots/ holds only /framework/ui/card/
- B "Left/Right siblings, Up/Down variants" — yes — `Library.on_keydown` in the diff; not run by me
- B "url updates like a click" — yes — it calls `this.go(next.path)`
- B "ignore in input/textarea/contenteditable" — yes — `closest("input, textarea, [contenteditable]")`
- B "prove with Playwright, two urls in log" — no — not found in session.jsonl
- Docs "library readme and card readme in the same commit" — yes — both in the diff
- Docs "smoke.mjs no FAIL" — no — no result recorded
- Class change: "can a page show the class's live instances?" — n/a — no class added (a CSS rule and a key handler)
## Page structure
- not measured on the changed variants — no shot. shots/framework-ui-card/1920.png, top band: title "Card", then specimen, then code: yes, the page has one title and a clear takeaway
## Navigation
- Techniques: the library rails (siblings, variants) plus arrow keys. Not shown in any shot.
- No tabs added; n/a for tab questions
## Layout
- layout.json 400: layout doc, overflow_x false — yes for the existing page; the new variants are not shot
## Sizing
- `fit` capped to 22em — not measured (no 3440 shot of the variant)
- shots/.../3440.png: the old large card stretches full column — that gap is what `fit` is meant to fix; unverified
## Wrapping
- layout.json 400 tab_rows 1, overflow_x false, widest_text 365 — yes (existing page only)
## Spacing and padding
- layout.json 400 left_stack p total 46 (card 19, demo-screen 11, page 16) — yes for the existing specimen; the stack and tree-rows variants unseen
## Colour and contrast
- n/a — no colour change in the diff; the flush-stack move is neutral
## Flow
- Widths given: 400, 1200, 1920, 3440 of /framework/ui/card/ only. The new intro section "Five card styles…" sits below the first specimen; its position is not shown in a shot — not measured
## Words
- Words 1 — yes — page.js notes are plain sentences
- Words — no — "Four variants, not six" contradicts the nine now listed; the note on `fit` says "~1800px wide at 3440" without a link to /live/session/
