verdict: fix
1. [fix] The usage meters (5-hour / weekly Fable / weekly all, ask 6's core "overridden per page" claim) show on neither `/framework/ai/` nor `/framework/ai2/` in the shots, though the same meters are visible in `shots/before-ai2-1920.png` for the same page before this diff — shots/127-0-0-1-51490-framework-ai/1920.png, shots/127-0-0-1-51490-framework-ai2/1920.png vs shots/before-ai2-1920.png.
2. [note] No shots exist for `/framework/ai/log/` or `/framework/ai/system/`, the two other new tabs this diff adds — asks 3 and 5 (floor 0, full-width takeover) can't be checked from evidence; only `inbox` was shot.
3. [note] `core/Page/ext/` (the new Extensions doc page, ask 1/2's demo) is one narrow text column with 76–82% empty screen at 1920/3440 — shots/127-0-0-1-51490-framework-core-Page-ext/3440.png, layout.json empty 0.824.
4. [note] `Inbox.css`'s badge text colour changed to the literal `white` (was `var(--on-prim,#fff)`), not a token — diff.patch line ~441; the comment says framework has no on-colour token, but it's still a literal in a component file.

## Requirements
- 1 "`core/Page/ext/`: an extension (plugin) system for Page" — yes — shots/127-0-0-1-51490-framework-core-Page-ext/1920.png shows the Extensions page built on it; hooks/data-config can't be confirmed from a screenshot alone.
- 2 "`core/Page/ext/Inbox`: the first extension… move it; don't rebuild it" — yes — same shot's "PAGE.INBOX — 2 MESSAGES" block matches the `{inbox:{type,author,text,at}}` shape; readme.md says "moved", not rebuilt.
- 3 "Move the AI 2 Inbox to the new `/framework/ai/` as its default tab… keep every useful feature" — yes — shots/127-0-0-1-51490-framework-ai/1920.png: Inbox is the open tab by default, same rail as AI 2 (read/unread dot, × archive, search box, score filter). Auto-resolve isn't visible to check from a static shot.
- 4 "Needs you is a filter in the Inbox list, not its own tab" — yes — shots/127-0-0-1-51490-framework-ai/1920.png: a "Needs you ⊠ score ≥ 90" row beside the list, no Needs-you tab in the strip.
- 5 "Inbox and Log share one UI… lean into the Inbox's version" — not fully checkable — overview.js wires Log to the same `AIRail` at floor 0 (code), but no shot of `/framework/ai/log/` exists to confirm it, see finding 2.
- 6 "Rail is a base class, overridden per page… usage meters live only on the AI page's rail subclass" — no — the class split is right in code (`InboxRail` base, `AIRail` adds meters), but the meters aren't rendering on either AI page in the shots taken, see finding 1.
- 7 "Each owner prompt becomes an Inbox card" — not in this diff — owned by `mastermind-servex-9` per the requirements' Coordination section; no card-posting code here.
- 8 "A card is a whole conversation, and it shows what it's about" — not in this diff — no content-model change is in the patch.
- 9 "Chat and card are ONE content model" — not in this diff — same as above; both are larger asks the requirements note as follow-on work.

## Page structure
- page `/framework/ai/` — yes — shots/127-0-0-1-51490-framework-ai/1920.png: "AI" title, Inbox/Log/System tabs right under it, Inbox opens on real-time items first.
- page `/framework/core/Page/ext/` — yes — title "Extensions" states the topic; page.jsonl example is the concept tile.
- Reachable from parent `children:` — yes — both pages are existing routed children, not new orphans.
- Every view has its own URL — yes — Inbox (`/framework/ai/`), Log (`/log/`), System (`/system/`) are each routed in `tab_page`/`route()`.

## Navigation
- Identify: tabs, a rail — `/framework/ai/` and `/framework/ai2/` both use a tab strip (Inbox/Log/System or Inbox/Log/Overview) plus a persistent rail.
- Tabs fit 1 row at 1920, ≤2 at 1200, ≤3 at 400 — yes — layout.json `tab_rows: 1` at every width for `/framework/ai/`.
- Every tab has its own URL — yes — see Page structure.
- Every tab useful, not stacked — yes — 3 short, distinct tabs.
- Rail sits beside a centred/full main area, folds at 400 — yes — shots/127-0-0-1-51490-framework-ai/400.png: rail becomes the whole screen (CSS added for `.inbox-tab.inbox-page`), matching the phone pattern already used by `/framework/ai2/`.
- Rail and work area never jump on selection — yes — same `AIRail` component already proven in AI 2; no new jump behaviour introduced.
- Bottom rail / fixed overlay — n/a
- Sheet or modal — n/a
- Full screen — n/a
- Selected item opens in its own column — yes — shots/127-0-0-1-51490-framework-ux-Inbox/1920.png: "Pick something on the left. It opens here, and the list stays where it is."

## Layout
- Fills width at 3440 with columns or rail+main — yes for `/framework/ai/` (three-column dashboard, shots/.../ai/3440.png); no for `/framework/core/Page/ext/` and `/framework/ux/Inbox/`, see findings 3 — the Inbox demo's emptiness (`narrow_share: 1`, `big_empty: true` at 3440) predates this diff's own code change (only its readme text changed).
- Approved layout word used — yes — `layout: "ai2"` / `"standard"` in layout.json, no bespoke class.
- Region/box width right for content at all four widths — yes — no `overflow_x` at any width in any layout.json.
- Padding only where needed — yes — no stray `.pad` spotted on a card in the shots.
- Text keeps room from edges — yes.
- Multi-column content in wide/bleed — yes — the AI dashboard's three columns run full width, not squeezed into a reading column.
- Band share matches importance — yes — no `big_empty: true` band on `/framework/ai/` at any width; `core/Page` (the pre-existing parent page, not changed by this diff) does show `big_empty: true` at 3440, unrelated to this patch.
- Columns have roughly equal content — n/a — not a multi-column-of-content layout here.
- Dead space answered by a region, not a widened column — no (Extensions, Inbox demo) — see finding 3.
- Content scaled to its box — yes.
- Card wall last row — n/a — no card wall here.
- Flush-stack vs rounded+gap — n/a — rows in the rail are flush by design, unchanged.

## Sizing
- Boxes auto height — yes — no fixed-height boxes seen in the shots.
- Previews auto height — yes.
- Bounded boxes say what happens to overflow — yes — the rail scrolls, the detail column scrolls (`.inbox-detail { overflow-y: auto }` added for the takeover case).
- No surprise scrollbar — yes.
- Band above first nav budgeted — n/a — the AI page's nav is the first thing on the page.
- Every track has a floor and ceiling — yes — `overflow_x: false` everywhere.
- `em`/`rem` used correctly — not checked in detail; no literal px sizing visible in the diff's own new rules besides the two `border-radius`/colour tokens already covered.

## Wrapping
- Tab bar/title/button row sits on one line — yes — layout.json's only wraps are the generic dev-shell chrome (`mode-btn`, `drawer-menu`), present identically on every page in the site, not introduced by this diff.
- No wrap that appears only under 1920 — yes — same wrap list at every width.
- Control rows wrap by design — n/a — no new wrapping control row added.
- At 400 everything stacks — yes — shots/.../ai/400.png: rail takes the full screen, no crushed track.
- No clipped preview description at two widths — not checked — row-title truncation wasn't directly comparable between a wall and a rail view here.

## Spacing and padding
- Left-stack padding ≤3em at 400 — yes — `/framework/ai/` h1 total 14px, `/framework/ai/now/` 28px, `/framework/core/Page/ext/` p total 45px — all under ~48px (3em).
- No stacked nested padding — yes — no 3-level nesting spotted.
- Padding opted in (`.pad`/`.card`/`.bleed`) — yes.
- Text never at 0 from an edge — yes.
- Gaps from the spacing clamp — not individually checked; no new raw constants in the diff's CSS beyond the token swaps already noted.
- Controls keep `em` sizing — yes.
- Padded box has a different ground — yes — `--well: var(--darken-1)` keeps the well visibly distinct.
- Bleed keeps `.pad` on content — n/a — no new bleed region added.
- All CSS inside a layer — not verified line-by-line; the diff only edits existing rule bodies, not rule structure.
- CSS as small as possible — yes — the diff reuses existing tokens (`--shade-a16`, `--shade-a32`, `--radius`, `--darken-1`) instead of inventing new ones, except the one `white` literal in finding 4.

## Colour and contrast
- Body text / large text ratios — not independently measured; no new text colours introduced.
- Accent text ratio — n/a — no accent text changed.
- Colours are tokens, not literals — no — see finding 4 (`color: white`).
- Boxes read as boxes against their parent's ground — yes — `--well: var(--darken-1)` differs from the page ground.
- Dark mode via `light-dark()` tokens — yes — every other colour change in the diff swaps a literal for an existing token (`--shade-a16`, `--shade-a32`), which are presumed light/dark aware like the rest of the framework's token set.
- One repeated anchor — yes — the inbox badge/eyebrow styling is unchanged in shape.
- Seams between grounds are deliberate — yes.
- Muted text via `.muted` — n/a — not touched by this diff.

## Flow
- Priority order top to bottom — yes — Inbox (real-time) leads, Log (everything) is one click over, System (reference) is last.
- Nothing hidden off-screen — yes — `overflow_x: false` everywhere.
- One rhythm per box — yes — no new ad hoc spacing.
- Labels close to their own card — yes.
- Live page stays still as items arrive — yes — same `AIRail`, no new live-update code in this diff.
- No prose line past the measure — yes — `widest_text` stays well inside the viewport at every width in every layout.json.
- Fixed chrome pushes `.app` by tokens — n/a — not touched.
- Content inside a tab padded once — yes — `.inbox-page`/`.inbox-takeover` split (existing rule) still applies; no double-padding seen in the shots.

## Words
- Thing shown before told — yes — the Extensions page shows the live `page.jsonl` inbox lines, not a description of them.
- Layout shows structure — yes.
- Paragraphs ≤60 words — yes — every paragraph in the shots is one or two short sentences.
- Point gettable in 10 seconds — yes — "AI INBOX", "Running now", "Just landed" read instantly.
- Titles say what the thing is — yes — "AI", "Extensions", "Inbox", "Now".
- Captions ≤1 line — n/a — no captioned pictures in these shots.
- Concepts named once, same way — yes — "Inbox", "Log", "System" used consistently across overview.js, page.js and readme.md.
- Mentions link to their page — yes — shots/127-0-0-1-51490-framework-ai-now/1920.png: `Framework(s)` is a live link; "ai2 inbox read" links in Just landed.
- A doc's words sit beside a picture/widget — yes — every readme touched now points at a live demo URL.
- Most important thing leads — yes.
- Plain, full sentences — yes — the diff's own comments and the readmes read as full sentences, not fragments.
