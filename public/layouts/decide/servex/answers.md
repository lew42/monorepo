_Run with `node Server/ask-each.mjs questions.md --context servex/context.md` (Sonnet): 5 questions, one at a time, one session (e371d501-7288-4597-9fee-93792958ec53). Total cost: $0.9078. The page it was given: [context.md](context.md)._

## 1. How much room is there?

**What's already spoken for:** the left nav (~270px, collapses on phone). This Doc page has no side table-of-contents and no extra rail today — the Overview/Notes tabs sit at the top, not the side. So nothing else claims width before the content draws.

**What's left:** on a phone, one column, full width — that's the floor, always. On anything wider, since no rail or ToC is already eating space, everything to the right of the nav is free. I'm picking **most of a 3440 screen** as the room available for this page — not because the five bullets need to fill it, but because nothing is already reserved that would shrink it to a single reading column by default. What we *do* with that room (stretch text, add a tile wall, split it) is the next question, not this one.

## 2. How much content is there?

This page's actual content (the Overview tab) is short: one bold sentence, a heading with five one-line bullets, and one pointer line to the readme. No paragraphs, no sub-sections — each of the five parts is a single line, not written out yet. That's not "about one screen" of reading; it's a handful of lines that would look lost stretched across a big box.

I'm picking **a little: a preview card, a few lines.** The five parts might each grow into their own page later (like "roles" already has), but today there's nothing under them to structure — so the layout should hold this content tightly, not build scaffolding (tabs, a left nav of sections) for content that doesn't exist yet.

## 3. Is it outlined yet?

**Yes** — the order is already written down, right there in the page as it stands today:

1. Title + one-line description
2. One bold definition sentence
3. Heading "Its parts" + five one-line bullets, in a fixed order (Agents & roles → Cards → Dev servers & proxy → Restart → MCP tools)
4. One pointer line to `Servex/readme.md`
5. Tabs: Overview (all of the above), Notes (just "roles")

No demos, no screenshots, nothing live — it's plain sentences and a short list. Four of the five parts don't have child pages yet, so they're bullets, not links to build a nav around. That's a complete outline for a small page; nothing here is a guess waiting on content that doesn't exist.

## 4. How will the content fill the width?

The five parts are the only piece of this page with more than one item, and they're already the same shape — a name plus a one-liner, five of them, in a fixed order. Turning that list into a **tile wall of five cards** is what actually uses width: on the 3440 screen the cards sit in a row (or wrap to two), each with room to breathe instead of cramping into a bullet list; on a phone they stack to one column, same content, no layout invented for the phone case.

The title/description and the bold definition sentence stay as plain text above the tiles — they're a single short block, not a column that needs a partner. And I'm ruling out "one small box, space left on purpose" here: with a little content spread this thin, a tight little box in the middle of a 3440 screen is exactly the stranded-column failure the owner wants avoided; the tile wall is what gives the little content a reason to use the width instead.

**Pick: Tile wall** (for "Its parts"), plain text above it for the title/description/bold sentence.

## 5. Which approved layout fits?

**Tile wall.** It's already an approved layout, and it's the one that matches what the last question found: a short intro (title, description, one bold sentence) followed by exactly one piece of repeated, same-shape content — five one-line parts. Standard would leave a page as one bare column even on the 3440 screen. Rail + content and Docs three-region assume a side rail or table of contents this page doesn't have. Columns and Split don't fit five equal-weight items as naturally as a wall built for cards of the same shape does. No new layout needed — the plain text sits above the tile wall, same page structure works from 400px (tiles stack to one column) up to 3440 (tiles fill the row).
