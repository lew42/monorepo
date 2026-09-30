verdict: fix
1. [fix] White text on the "Strong hue" ground (`.card-prim`, `var(--prim)`, orange) is about 2.5:1, below the 4.5:1 body-text floor and the 3:1 large-text floor (css 11). The `color-scheme: dark` island makes the ink light, and light ink on a light orange fails. See shots/…card-grounds/1920.png, the "STRONG HUE / var(--prim)" card, and shots/…card/1920.png, the "Strong hue" title. Give the strong-hue island dark ink, or use a darker primary step as its ground.
2. [fix] The Whisper page prints literal asterisks: "**read the actual log file for the whisper process.**" (shots/…card-log-whisper/1920.png, band 2). `p()` reads backticks, not markdown bold. Remove the `**`, or use a real `strong`.
3. [note] The "Light gray" ground is `--wash`, which is also the page ground, so a `.card-gray` placed straight on the page paints nothing (css 14). Two examples: shots/…card-mini-pages/400.png, "The decision" card, which shows only as a faint outline, and shots/…card/1920.png, where "Light gray" matches the page. It reads only inside a white demo frame. Either the doc/system.md table says "light gray only on a white ground", or the ground needs a darker step on the page.
4. [note] The first demo on Log is empty until someone clicks a button (shots/…card-log/sheet.png, top band at every width). A nested log you can see first appears in the second demo, below the fold at 1920. Pre-running one `increment()` would put a live group on screen. The Whisper log is empty in the same way until you press Start, which is fine because that demo needs the server.
5. [note] On the Cards index at 1920, the preview wall ends 4 + 2, leaving two blank tracks on the right (layout 11) — shots/…card/1920.png, band 3. At 1200 (2 + 2 + 2) and 3440 (6 in one row) it is balanced.
6. [note] The core/Page tab bar still takes tab_rows 2 at 1920, 3 at 1200 and 6 at 400 (layout.json). That misses page 14. It is not this task's bar and was already relayed (reply.md 6). The only line this diff adds to it is `card` in `children`.
7. [note] Fixed since the last pass, confirmed: one `BOXED_LEVELS = 3` in card/depth.js is now imported by both nesting/page.js and LogView.js. The `page_work` box moved to the bottom of Log and Whisper. The headers "Clickable" card routes to `../mini-pages/first-steps/`, not `#`. The Cards index opens with a live sample, not prose. The dark island's `color` fix makes "Going deep" readable (…card-mini-pages/400.png). The `card` link is in core/Page's children and readme. The page skill has "Cards: which one, when" (page/SKILL.md:75).

## Requirements
- 1 "Inventory… one table… with screenshots" — yes — card/inventory.json, doc/inventory.md, 9 inventory/*.png in the diff
- 2 "a card is a MINI PAGE… grounds… nesting… title, header and menu… scale" — yes — five child pages grounds/nesting/headers/mini-pages/scale, shots/…card/1920.png; except the strong-hue contrast (finding 1)
- 2 "a list of clickable cards means ROUTED pages", "a line in the parent's page.jsonl" — yes — MiniPages.js route(); page.jsonl lines; no folders
- 2 "referenced from core/Page's readme" — yes — core/Page/readme.md +card line
- 3 "a short 'cards' section into the page skill" — yes — page/SKILL.md:75
- 4 "this.log(…)… LOG GROUPS… nested… collapsible… console AND a renderable log (JSONL where it should persist)" — partly — Logger.attach/wrap/group, LogView `<details>`, Logger.Console, Logger.JSONL + from_jsonl; nothing writes a real file yet (accepted, reply.md 4)
- 5 "Whisper transcription debug view: raw chunks, resends, local-agreement, seams" — yes — whisper/Instrument.js: tick groups, transcribe() raw text, "N words agreed", highlighted commit, seam groups, clickable seams in Transcript
- 6 "reuse the owner's past logger ideas" — yes — Whisper page credits the "read the actual log file" idea
- Added 09-30 "Inbox / Log view / status lights" — no, deferred — split to next-log-view/requirements.md with mastermind-servex-8's agreement
- Rules "keep v1 reachable", "screenshots at 1920 and 400" — yes — no v1 was restyled; shots/ holds 400, 1200, 1920, 3440

## Page structure
- page 1 — yes — every title plus its first line says what the page is (shots/…/1920.png)
- page 2 — yes — Cards index: a live sample, then the six topics as a preview wall (…card/1920.png)
- page 3 — yes — the demo comes first on each child; the `page_work` box sits last
- page 4 — n/a
- page 5 — yes — core/Page children lists `card`; card lists all six; log lists `whisper`
- page 6 — yes — mini pages have real URLs; the headers clickable card routes
- page 7 — yes — standard page, a `grid auto` wall, the site's previews()
- page 8 — yes — the grounds, levels and headers are each labelled
- page 9 — yes — no control sits alone on a row
- page 10 — yes — a live sample instead of a description; the scale page uses a table
- page 11 — yes — each demo has an h3/h4 section title
- page 12 — n/a — nothing existing was restructured

## Navigation
- page 13 — the sidebar tree; tabs only on the parent core/Page
- page 14 — no — core/Page tab_rows 2 at 1920, 3 at 1200, 6 at 400 (not this task's bar; finding 6)
- page 15 — yes — core/Page tabs are routed
- page 16 — n/a
- page 17 — yes — the sidebar sits beside main at 3440 and folds to ☰ at 400 (…card/sheet.png)
- page 18 — yes — the sidebar stays still
- page 19 — yes — the 400 bottom bar (⋯ ✦) clears the content; the last row is visible after scrolling
- page 20 — n/a
- page 21 — n/a
- page 22 — n/a — groups expand in place by design (`<details>`, open by default)

## Layout
- layout 1 — no — every child is one reading column at 3440 (empty 0.80–0.85); acceptable for demo pages, but the demos are the only things that go wide
- layout 2 — yes — Standard; the index is a Tile wall
- layout 3 — yes — cards fit their content at every width; the index sample wraps 4 → 2 → 1
- layout 4 — yes — `.card` pads; the controls box uses `card pad` (see css 3)
- layout 5 — yes
- layout 6 — yes — the index sample is `wide`
- layout 7 — yes — only the 3440 demo frames are big_empty (grounds, headers, log, scale), and those are the demo tool's own mega frame
- layout 8 — n/a
- layout 9 — yes
- layout 10 — yes
- layout 11 — no — the preview wall is 4 + 2 at 1920 (finding 5)
- layout 12 — yes — the rounded cards have gaps between them

## Sizing
- layout 13 — yes — all auto height
- layout 14 — yes — the previews clamp their description with an ellipsis and are otherwise auto
- layout 15 — n/a
- layout 16 — yes — the only scrollers are code blocks and the demo frames
- layout 17 — n/a
- layout 18 — yes — overflow_x false on every page at every width
- layout 19 — yes — card.css uses em for controls and tokens for spacing

## Wrapping
- layout 20 — yes — no wraps except the shell's own buttons; "Whisper debug log" h1 takes 2 lines at 400, which is acceptable
- layout 21 — yes — no wrap appears only below 1920 on any card page
- layout 22 — yes — the Whisper controls are `flex gap wrap`
- layout 23 — yes — the cards stack to one column at 400 (…card-mini-pages/400.png)
- layout 24 — yes — the same ellipsis clamp at every width

## Spacing and padding
- css 1 — no, mild — the Cards index p left_stack is 66px at 400 (card 19 + card 19 + page 28), but that paragraph sits inside the three-deep sample on purpose; every child page is 28px
- css 2 — yes — three levels at most, then the box drops (the nesting demo)
- css 3 — no, small — whisper/page.js and the page_work boxes use `card pad`: `.pad` on a card
- css 4 — yes
- css 5 — yes — `--gap` and `--pad-card`; the log line gap is 0.2em by design
- css 6 — yes — `.card-menu-btn` has 0.3em padding
- css 7 — no — `.card-gray` on the page ground (finding 3)
- css 8 — n/a
- css 9 — yes — `@layer theme` in card.css, LogView and Transcript
- css 10 — yes — reuses `.card`, the tokens and `.size-*`; the index sets --column inline, a one-off

## Colour and contrast
- css 11 — no — white on `--prim` is about 2.5:1 (finding 1); the dark ground passes
- css 12 — no — the same pair
- css 13 — yes — tokens only
- css 14 — no — `--wash` card on a `--wash` page (finding 3)
- css 15 — yes — the islands use `color-scheme: dark`; the tokens are light-dark()
- css 16 — yes
- css 17 — yes — the grid-icon + title header repeats on all four samples
- css 18 — yes — `.muted` class used

## Flow
- layout 25 — no, mild — on Log, the first thing shown is code plus an empty log (finding 4)
- layout 26 — yes — overflow_x false
- layout 27 — yes — the log has its own tight line rhythm, and a group keeps the full --gap
- layout 28 — yes — the preview labels sit inside their own cards
- layout 29 — yes — LogView redraws in place, and new entries append at the bottom
- layout 30 — yes — widest prose is 718px at 3440; the larger widest_text values are code blocks (mini-pages, headers, nesting)

## Words
- content 1 — yes — the grounds, levels and logs are shown live
- content 2 — yes
- content 3 — no — the Whisper intro is about 90 words, and the Grounds and Nesting intros are about 70
- content 4 — yes — the Cards index gives the point in ten seconds
- content 5 — yes
- content 6 — yes — every demo caption is one line
- content 7 — yes — the four grounds are named the same everywhere
- content 8 — no, small — module names in the prose (`styles/sections/tone.js`, `ux/Content`, `card.css`) are code spans, not links
- content 9 — yes — each readme's page has live demos
- content 10 — yes
- content 11 — mostly — some jargon remains ("ALWAYS-DARK ISLAND", "window_s") without a plain explanation
