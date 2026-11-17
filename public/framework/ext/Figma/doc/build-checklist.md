# Figma build checklist: every agent, every build (2026-11-16)

**Read this before any `use_figma` edit, and run the "After building" steps before you report done.** It exists because the Explore pages built on 2026-11-16 looked broken to the owner (review at the bottom). Most of these rules already existed in [use-figma.md](./use-figma.md), but no agent's brief pointed to them and no agent checked its own result.

## Token rules: check these first (owner, 2026-11-16)

- **Padding is `pad-x` and `pad-y`. The gap between blocks is `gap`.**
- **`text-gap` only between lines inside one text stack:** never as padding, never as a page gap. (Found on the Live board: a card with padding bound to `gap` and its gap bound to `text-gap`.)
- **Every frame that sets a width also sets the Scale mode that matches that width.**
- **Big doc frames (page containers, 5000 wide) stay on 1000 Default,** not the page's size mode. Presentation wrappers never take a small page mode; only specimen regions do.
- **Long text gets a max width bound to `measure` (720).** A text layer can't bind max width (the API refuses it), so bind it on the text's frame. (Found: labels 1520 wide.)
- **Less words, more essence.** Every example shows the simplest undeniable case. Names over sentences. No step sequences unless each step visibly builds on the last.

## Before building

1. **Read `Index` (page 0:1) and reuse what is there.** Never make a component that already exists. If you need a new master, ask first; once approved, add it to `Index` in the same step. Rules: [design-system-notes.md](./design-system-notes.md), "Core rules".
2. **Read [use-figma.md](./use-figma.md), "The recipe"**, which covers binding, modes, compose order and the screenshot check.
3. **Re-read the page before every edit.** Leave alone any page the owner is editing by hand.

## While building

- **A row whose children are all Fill height never grows** (2026-11-16, [master pass](./master-pass.md)): when content inside gets taller, the row keeps its old height and the content spills out. Let one child (the sidebar or the tallest column) Hug and drive the height; the others Fill.

- **Every container is auto layout.** A page's content sits in one vertical auto-layout frame: a page title, then one section per topic.
- **Layout is parent-down (owner, 2026-11-16).** The container sets the width (fixed or Fill) and the Scale mode; content below it is Fill, so text reflows. Never make a hug-width card whose width comes from a fixed-width child: a child that is the source of the layout can't be found when it breaks. A master meant to be swapped into a slot is Fill width and carries no fixed width of its own, and a content master carries no explicit Scale mode (the container's mode applies). Why: the swap test card (`100:5846`) hugged while its content was fixed at 320, so swapping in `360 / App bar` pushed the layout wide; the App bar also had a fixed height and no mode, so it picked up the default 48 px padding. Check: swap the slot into every master at that master's own size (2026-11-16: 17 masters, no overflow).
- **Sizing is Fill or Hug.** Fixed only where named in the layer (`Nav (fixed 320: rail)`).
- **Never give a layout container a fixed height.** Height is Hug (content) or Fill (a full-height column).
- **Sidebars are Fill height** inside any full-height layout; a sidebar never floats at content height. The parent row uses counter-axis stretch, and the sidebar is Hug × Fill (or a named fixed rail × Fill).
- **Reading width.** Body text never runs wider than about 720 px, roughly 65 characters at 16 px. Put a max width on text containers (bind the max width to the Scale `measure` token, 720 in every mode; `squeeze` is the wider content maximum). Never let a paragraph span a 1500 px column.
- **Type and width.** At 2600, 16 px body text looks tiny. Either keep text in a narrow measure or set type per Scale mode. Scale has no type tokens yet except `h1-size`, which is an open question for the owner.
- **Mobile (600 and under) is one column.** Never put two cards side by side at 400.
- **Doc labels use one small style:** a kicker (label), a title (h3, at most about 6 words) and one plain line. Config details such as "SM, 480, root XL" go in the plain line, never the title. A label is never bigger than its page's section heading.
- **Demos use instances of the layout masters.** Never hand-build the same layout four times (the 2600 page's section 5 did).
- **Master components sit loose on their home page's root canvas** (never inside a frame, owner's rule), placed near the organised frame. None go off at x −13000.
- **Anything pasted onto the canvas** (screenshots, notes) gets read, acted on, then deleted or moved to a `Feedback` frame. It is never left loose.

## After building (required, before "done")

1. **Screenshot the whole page and each section** (`get_screenshot`, `maxDimension` 2400) and look at them. Look for overlaps, text cut off, floating panels, empty space at the bottom of frames, giant or tiny text, lines too long to read, and wrong widths.
2. **Long-text test:** make one title wrap to 2 or 3 lines and check nothing breaks.
3. **Narrow test:** check one instance at 400 wide.
4. **Report with the screenshots,** not just links, listing what you checked and what is still off.

## Proposal: the sidebar system (not decided)

One master, **`Layout.Sidebar Set`**, with variants `Side=Left | Right | Both` (and `State=Open | Closed` only if it is animated):

- **Root:** a horizontal auto-layout row, Fill × Fill, counter axis stretched.
- **Sidebar:** Hug × Fill (or a named fixed rail × Fill), Scheme fill white, Scale `SM`. Its width comes from a token or a named rail (280, 320, 480).
- **Main:** Fill × Fill, Scale set by width (LG for regions wider than about 1200).
- **Use:** drop an instance and put content in the main area. If an instance won't do, copy the structure exactly (row, stretch, Hug × Fill sidebar, Fill × Fill main).

## Proposal: the layout library (not decided)

Following the owner's lean toward building blocks over permutations, there are two masters:

- **`Layout.Sidebar Set`** (above).
- **`Layout.Columns`**: a row of Fill columns with placeholder cards. To get 3 or 4 columns, duplicate or delete a column; there are no Columns=1..6 variants.

Permutations (2, 3 or 4 columns; full-height vs. auto-height vs. card columns) are shown as instances on a `Layout` page for reference. They are not masters.

## Review: Explore – 2600 layouts (34:475), 2026-11-16

| # | Problem | Where | Fix |
|---|---|---|---|
| 1 | Variant labels are two lines of large bold text above every demo, so they read as headlines and dwarf the layout. | e.g. 34:1329, 34:1237, 34:2382 | Use the small label style; move config details into the plain line. |
| 2 | Sidebars float at content height (about 330-370) inside layouts 1100-1600 tall. | 2a, 2b, 3a, 3b, 5a-d, 6 | Fill height; parent row stretched. |
| 3 | Layout frames have fixed heights (1100, 1400, 1600), and the page card is fixed at 1472, leaving empty space at the bottom. | sections 2-6 | Hug height, or Fill inside a viewport-sized frame. |
| 4 | Body text in the 3a page card spans about 1450 px, around 200 characters per line. | 34:1306 | Max width on the text column. |
| 5 | Text doesn't scale: 16 px body and about 13 px nav in a 2600 frame look tiny at fit-to-screen zoom. | all | Narrow measure, or type per Scale mode (open). |
| 6 | Mobile Miller at 400 puts two cards side by side, so "Card 1" wraps word by word. Children were Fixed where they should have been Fill (the owner fixed two by hand). | 34:1572 | One column at mobile; Fill children. |
| 7 | New `Button`, `Card`, `Page card`, `Nav item` and `Sidebar` masters duplicate ones that already existed on Scale. | 34:476-34:500 | Reuse via `Index`. Button and Card were deduplicated (Card `34:478` and `Page card` `34:500` deleted 2026-11-16); `Nav item` and `Sidebar` are pending. |
| 8 | Masters are scattered far left (x −3000 to −13000) and labelled with long sentences. | page root | Place them near the organised frame with short labels. |
| 9 | Section 5 rebuilds one layout four times by hand. | 5a-5d | Use four instances with different modes. |
| 10 | The notes frame is small text in lines 2472 px wide, too long to read. | 36:1239 | Max width 720, or split into short cards. |

**Root causes:**
- The briefs didn't carry the existing rules in use-figma.md.
- No required screenshot review.
- Several agents worked in parallel and none owned the whole page.
- Doc sprawl: `doc/` holds 35 files, so an agent can't tell which apply.

**Suggested (not done): consolidate the docs.** Keep this checklist (how to build), [use-figma.md](./use-figma.md) (the API recipe) and [design-system-notes.md](./design-system-notes.md) (decisions and open questions). Archive the rest under `doc/archive/` after the owner agrees.
