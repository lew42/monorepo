verdict: fix
1. [fix] `ext/Chat/doc/scroll.md` line 30 is stale: it still says "Every bubble is `--chat-bubble` wide (85% of the column, at most 34rem)". This diff removed that token and that rule. It should say: your bubble hugs its text up to `--bubble-max`, the reply is plain text, see `bubbles.css`.
2. [note] Do 5 (shots through `monorepo.lew42.com` with the phone UA) is still not met. The six `screens/` come from the worktree's own dev server, `127.0.0.1:62509`. The walkthrough gives a sound reason (the branch is not on that host until it merges, and the host answers 401 to a headless browser). Reshoot the six after the merge.
3. [note] `shots/` is empty again and there is no `layout.json`, so nothing was measured. `session.jsonl` says `review.mjs` OutPath refuses an output folder inside a worktree. That is a `Server/review.mjs` gap, not this task's, and every worktree review will hit it. This review judged the builder's `screens/` instead.
4. [note] The growth proof stops at the draft. `bubble-grow.mjs` checks guess → settled inside `.chat-v3-draft`, but not the swap from the draft to the real Prompt card when the sentence lands. The draft pill also has a 1px dashed border that the real pill doesn't, so the swap can still shift the width by about 2px.
5. [note] The V1 half of `bubble-grow.mjs` sets `textContent` on an existing `.chatbox-you`. It doesn't go through `chat().live()`, the path a mic really uses, so it proves the CSS but not V1's live path.
6. [note] In `ext/Chat/readme.md` the picture's alt text says "the three views at 360 px", but the picture shows V3 only. Also, the two new "Files that matter" bullets sit before a blank line, which splits that list in two.
7. [note] The V3 reply text has looser lines (`.chat-v3-text` line-height 1.45) than V2's sentence replies, and it leaves a bigger gap above ▶ ↺10. Compare screens/v3-360.png band 3 with screens/v2-360.png band 3: the same reply runs about 50px against 40px a line.
8. [note] At 1920 the chat column is only about 630px wide (x 310–940). About 630px of empty page sits to its right (screens/v3-1920.png, all bands). The 80% cap is 80% of that narrow column, so the long pill is 499px. This is the page's own measure and was there before this diff, but it is why the owner sees "80%" as about a quarter of the screen.

## Requirements
Widths given: none (shots/ empty, finding 3). Judged from the builder's screens/ at 360 and 1920.
- 1 "my messages are bubbles, right-aligned, that hug their text; one word like /compact is a small pill" — yes — screens/v3-360.png band 2, the `/compact` pill is about 91px; screens/v1-360.png, `/compact` and "great, thanks" hug
- 2 "a bubble grows while I dictate … widens until about 80%, then wraps" — yes — `bubble-grow.mjs`: V3 41→145→259→259 at 360 and 47→166→499→499 at 1920; guess→settled 259→259 (draft-to-card swap untested, finding 4)
- 3 "assistant's text has no visible bubble, plain, left, about 80% wide at most" — yes — bubbles.css `background: none; border: 0`; screens/v2-1920.png and v3-1920.png show plain replies on the left
- 4 "visual hierarchy: told apart at a glance" — yes — screens/v3-1920.png, tinted pills on the right, plain text on the left
- 5 "bubbles come from the list's ids; a growing Prompt updates its own bubble in place" — yes — replies carry `data-id` (ChatV3.reply), Prompt cards stay keyed by `els.get(p.id)`; the live draft is a separate card until its Prompt lands (finding 4)
- Do 1 "one shared rule set, not three copies" — yes — `ext/Chat/bubbles.css`, loaded by Chat.js and ChatV3.js; Widget.css only sets the token
- Do 2 "grow live, no jump when the final text replaces the guess" — yes — the same test as requirement 2
- Do 3 "phone first 360×740, gutter, no horizontal scroll; 1920 too" — yes — screens/v3-360.png keeps a 30px gutter; `bubble-grow.mjs` checks for no horizontal scroll at both widths
- Do 4 "keep ✓/🧠 marks, read-aloud highlight, links, tap to pause, dim guess, order; run the browser tests" — yes — ✓ and 👍 in screens/v1-360.png, the link in v3-1920.png, highlight-by-id test added to Recite.test.mjs; run-all passes, except three Dictate scripts that timed out only while a review ran beside them and pass alone (session.jsonl)
- Do 5 "shots of V1, V2, V3 at 360×740 and 1920 through monorepo.lew42.com with the phone UA; a one-word pill and a long wrapped message; a walkthrough" — partly — all six shots and the walkthrough exist; the host is 127.0.0.1, with the reason given (finding 2)
- Do 6 "document in ext/Chat/readme.md, one short section with a picture" — yes — readme "The layout" section (finding 6)
- Class with a page of live instances — n/a, no new class (ChatV3 gains `you()`/`you_class()`)
- Docs current and indexed — no — scroll.md is stale (finding 1). v2/readme, v3/readme, Recite/readme and ux/Dictate/readme were updated. The task is indexed in the main session.jsonl. A fresh agent can continue from walkthrough.md, which links the requirements, past-work, the review and screens/.

## Page structure
- page 1 (the title says what it is) — yes — screens/v3-1920.png, "Chat v3" top band
- one purpose per page — yes — each view page draws one conversation

## Navigation
- techniques — a sidebar (1920), a bottom rail (360), a right drawer (1920); this diff does not change them
- the rest — n/a

## Layout
- owner and assistant on opposite sides — yes — screens/v3-1920.png
- replies share one left edge — yes — screens/v2-1920.png, all replies start at x≈320 (round 1's indent is fixed)
- the content uses the screen — no (note) — screens/v3-1920.png, about 630px empty right of the chat (finding 8)

## Sizing
- a one-word pill hugs its text — yes — not measured; screens/v3-360.png `/compact` against the long pill
- both sides share one cap — yes — `--bubble-max` on both; screens/v2-1920.png, the reply wraps at about 460px, the pill at 499px

## Wrapping
- no mid-word breaks — yes — screens/v1-360.png, "Compacted." stays on one line
- wraps (layout.json) — not measured
- the URL in the intro breaks mid-word at 360 — yes, by design (overflow-wrap) — screens/v3-360.png band 1; this line was not changed by the diff

## Spacing and padding
- pill padding even — yes — screens/v3-360.png, the "Hello" pill
- gaps between turns clear and consistent — partly — the reply → ▶ gap is larger in V3 than V2 (finding 7)

## Colour and contrast
- the pill tint reads against the grey page — yes — screens/v3-360.png, dark text on light peach
- the guess stays dim — yes — the `.chat-v3-guess` rule is unchanged

## Flow
- the eye follows the turns top to bottom — yes — screens/v2-360.png
- no duplicate preview above a pill — yes — screens/v2-360.png, round 1's muted copy is gone

## Words
- walkthrough plain and short — yes — walkthrough.md, one screen, numbers given
- readme section clear for a newcomer — yes — names the cap, the token and the file; the alt text is wrong (finding 6)
- the demo caption in page.js matches the new layout — yes — "Your bubbles hug their words up to 80%…"
