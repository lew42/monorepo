verdict: fix
1. [fix] Requirement 2 ("grow live", no jump when the final text replaces the guess) has no proof: the walkthrough and screens show only finished messages, and no test or shot shows a pill widening while words arrive.
2. [fix] V2 at 1920 draws the reply "Hello! What would you like to work on?" indented about 200px right of every other reply (icon at x=523 vs 321) — layout (alignment), screens/v2-1920.png, band 3. V3 has no such indent.
3. [fix] shots/ is empty and its layout.json is missing (session.jsonl logged widths 400/1200/1920/3440, `bands: []`), so nothing is measured; the review judged the builder's screens/ instead. The walkthrough also says the shots came from 127.0.0.1:62509, not monorepo.lew42.com as asked (req 5).
4. [fix] `ux/Dictate/readme.md` is stale: `Widget.css` changed and now sets `--bubble-max` for the Dictate bubbles, but the readme never mentions `ext/Chat/bubbles.css` or the shared token.
5. [note] The assistant's text wraps well short of the 80% cap: at 1920 V2/V3 replies wrap at about 400-500px while the owner pill reaches 500px+ (screens/v2-1920.png, V3 "Compacted..." wraps at ~800px of 940). The two sides read as different max widths.
6. [note] V2 shows a faded, right-aligned preview ("I would like the chat to look more...") directly above the long pill, a second copy of the same words (screens/v2-360.png, v2-1920.png).
7. [note] No chat-layout/readme.md, and `past-work.md` and `screens/` are not linked from the walkthrough or the session record. A fresh agent can continue from `requirements.md` + `walkthrough.md` + the diff, but not from an index.

## Requirements
- 1 "owner's messages are bubbles, right-aligned, hugging; one word is a small pill" — yes — screens/v3-360.png: `/compact` 91px vs the long message 259px
- 2 "a bubble grows while the owner dictates; no jump when the final text replaces the guess" — no — no shot or test of growth (finding 1)
- 3 "the assistant's text has no visible bubble, left-aligned, about 80% at most" — yes — no fill in any view; but see finding 5
- 4 "hierarchy at a glance" — yes — screens/v3-1920.png, the tinted pill right vs plain text left
- 5 "bubbles come from the list's ids, a growing Prompt updates its own bubble" — yes — diff: `data-id` on replies, V3 `card_for()` unchanged
- 6 Do 1 "one shared rule set" — yes — one `ext/Chat/bubbles.css`, loaded by Chat.js and ChatV3.js
- 7 Do 3 "phone first, 360x740, no horizontal scroll, 1920 too" — yes — screens/v1-360.png, v3-360.png; walkthrough scrollWidth = clientWidth
- 8 Do 4 "keep marks, read-aloud highlight, links, tap to pause, dim guess, order" — yes — ✓ and 👍 marks in v1-360.png, link in v3-1920.png; Recite tests added. Browser run not re-run here.
- 9 Do 5 "shots of V1, V2, V3 at 360 and 1920 through monorepo.lew42.com with the phone UA" — no — six shots exist, but from 127.0.0.1 (finding 3)
- 10 Do 6 "document in ext/Chat/readme.md with a picture" — yes — readme.md line 30, picture v3-360.png
- 11 Class with live instances page — n/a, no new class
Widths given: 0 (shots/ empty).

## Page structure
- the Chat pages keep their title and one purpose — yes — screens/v3-1920.png, "Chat v3" at the top

## Navigation
- techniques used: a left sidebar, a bottom rail at 360, a right drawer at 1920 (unchanged by this diff)
- unchanged — n/a

## Layout
- owner and assistant told apart by side and fill — yes — screens/v3-1920.png
- V2 replies share one left edge — no — screens/v2-1920.png, "Hello!" reply indented (finding 2)

## Sizing
- one-word pill hugs its text — yes — layout.json not measured; the walkthrough's pixel widths (91 vs 259 at 360) show it
- the cap applies to both sides — no — finding 5

## Wrapping
- no word breaks mid-word — yes — V1 "Compacted." keeps one line (screens/v1-360.png, last band)
- wrapped lines in V2 at 360 are narrow — no — screens/v2-360.png, "Compacted. The conversation so far is..." wraps at about 5 words a line in the upper band; narrower than V3's
- wraps (layout.json) — not measured

## Spacing and padding
- pill padding even — yes — screens/v3-360.png
- gaps between turns clear — yes — screens/v3-1920.png

## Colour and contrast
- pill tint against the grey page — yes — screens/v3-360.png, dark text on pink, readable
- the muted guess text — yes — dim by design (finding 6)

## Flow
- the eye can follow the turns — yes — screens/v3-360.png
- the guess above the pill repeats the pill's text — no — finding 6

## Words
- the walkthrough and readme text is plain — yes — walkthrough.md, readme.md line 30
- the readme section is clear for a newcomer — yes — it names the cap, the token and the two-column grid
