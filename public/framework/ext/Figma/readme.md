# Figma — tracks Figma files as JSONL + saved screenshots, so the site can browse every page and rebuild designs without Figma

## Use

**Before any Figma design work:** the `figma` skill (`.claude/skills/figma/SKILL.md`): the file, the page convention, the recipe ([doc/use-figma.md](./doc/use-figma.md)), and [doc/troubleshooting.md](./doc/troubleshooting.md) when something goes wrong.

[Figma guide](/framework/ext/Figma/guide/): how Claude draws in Figma, coded from the 3440 design it drew ([doc/use-figma.md](./doc/use-figma.md)).

Page: [/framework/ext/Figma/](/framework/ext/Figma/) — files, then a file's pages as a preview grid, then one page large with its frames, then its compare view: `/framework/ext/Figma/<file-slug>/`, `.../<file-slug>/<page-slug>/`, `.../<file-slug>/<page-slug>/compare/<frame-slug>/` — real routed pages (`route()`, FigmaFilePage.js/FigmaPagePage.js/FigmaComparePage.js), so reload and back land in the same place. An old `?file=<key>&page=<node id>&compare=<node id>` link still opens — FigmaBrowse.js rewrites it to the real url in place. Rebuilt designs: [Color Schemes](/framework/ext/Figma/colors/), all nine Palette sections from Page 7, starting at [The Approved Schemes](/framework/ext/Figma/palette/) and declared by [palette](/framework/ext/Figma/palette/); plus [Auto layout](/framework/ext/Figma/autolayout/) (Page 8). The rebuilt pages use the site's style system (`--prime`, the four `bg-` grounds, one `.card`; [architecture](/framework/styles/doc/architecture.md)), so they show our accent, not Figma's blue, and keep only the CSS unique to each design. Each browse card shows its Figma shot and, when a page was built from it, a Built page link and a side-by-side Compare view.

Track or refresh a file (the Figma MCP only answers inside an agent session, so an agent supplies a spec of node ids and screenshot URLs; the script computes the rest):

```
node public/framework/ext/Figma/track.mjs spec.json
```

Scripts (run from the repo root): `node public/framework/ext/Figma/built.mjs` maps Figma node ids to built pages (re-run after adding a page); `thumbs.mjs` makes the 480 px card thumbnails; `visibility.mjs` lists any page.js no parent declares (the merge gate runs it, exit 1 if any).

## Classes

- `Figma` (`Figma.js`) — the system; `Figma.files()` loads every tracked file from `index.jsonl`; `files_sync()` is the one blocking read a cold deep link needs.
- `FigmaFile` (`FigmaFile.js`) — one tracked file: key, name, pages; reads `data/<key>/pages.jsonl` (newest line per id wins); gives every page and frame its slug.
- `FigmaNode` (`FigmaNode.js`) — a page or frame: name, size, screenshot, link back to Figma.
- `FigmaBrowse` (`FigmaBrowse.js`) — the files list (`/framework/ext/Figma/`); `route()` hands off to `FigmaFilePage`.
- `FigmaFilePage` / `FigmaPagePage` / `FigmaComparePage` — one file's pages, one page's frames, and the compare view, each its own routed page (`core/Page/dynamic/`).
- `slug.js`, `sync.js`, `grid.js` — the readable-url helper, the cold-deep-link blocking read, and the one card-grid renderer every browse level shares.

## Watch out

- **Figma-specific only.** General design guidance (space, contrast, layout, navigation) lives in the design system, [/framework/design/](/framework/design/), and applies to the browser and to Figma alike. This folder and its docs cover what only exists in Figma: auto layout, components, slots, variables, the MCP. When a finding applies to both, write it in `design/` and link it from here.

- **The design system file** (2026-11-05): "November 2026" (being renamed "Lew42 Design System"), key `hbolzQ3Xnc78rhxAPj8xK2`, is the library: tokens and components go there. Sept-2026 sits in the same Pro-team project and keeps its pages. Agents can create files (`create_new_file`). Details, library publishing and plan limits: [doc/use-figma.md](./doc/use-figma.md#the-design-system-file-owner-2026-11-05).
- **Claude works inside one frame** (owner, 2026-11-05): `Claude · working area`; duplicate the owner's nodes before editing, re-read before every edit, explain on the canvas (kicker + title + one line, clear layer names), not in chat. The rules in full: [doc/use-figma.md](./doc/use-figma.md#how-claude-works-in-a-file-owners-rules-2026-11-05). Doc and repo edits from a cloud chat go through a spawned local SDK agent.
- No tool lists a user's files: every fetch needs a file key from a Figma URL. Tracked now: Sept-2026 `QYN0G2URSBHYH5I06MOjxU`.
- Sept-2026 is also a Claude design file (owner, 2026-10-12; system work moved to the design system file above, 2026-11-05): Claude may add pages to it (`Claude · Overview` is the index) and its `prime` variable is the site's `#FF6157`. Leave the owner's own pages (1–8, Vector, Paragraph) as they are. July-2026 stays read only. Load the `figma-use` skill resource before any `use_figma`.
- **The process** (owner, 2026-10-12): design in Figma with the tokens and kit, click through it, approve it, then code it from the approved frame, so there is something tangible to revert to instead of a description.
- **Figma mastermind** (owner, 2026-10-13): one standing session owns the Figma work and keeps this folder's docs current (it took them over from the docs mastermind on 2026-11-09, after a lean audit: file-map, haiku-builds and mapping deleted, use-figma.md condensed to the design system file; git has the old text). Figma work needs no worktree; repo edits (docs, `tokens/`) still commit by path, and `tokens/` still goes through review and merge. Pages follow [doc/page-layout.md](./doc/page-layout.md) (one 1920 wrapper, auto layout, an Index page). Edit the main component, never the same override on every instance.
- Screenshots over 600 KB are refused by `track.mjs`; the Figma screenshot URL is short-lived.

## The design system file's page structure (2026-11-09)

- **Pages, in order:** UI (status, plan, one copy of each core piece; was `Index`), Page 1 (the owner's Drag and drop frame and My Card), Components, Cards, Layouts, Page builder (was `Pages`, mine), Images, Claude · Sandbox. This mastermind owns Page builder and any new page-builder pages; Cards, UI, Components, Layouts and Images belong to the cloud-chat agent (`voice-app`), so ask before touching them.
- **Cards page** (mine, owner 2026-11-10): the basic card has modes Padded and Unpadded, no fill variable (Scheme `surface`), sized to content, sizes from Resolution `card-pad`/`card-gap` ([doc](./doc/use-figma.md#card-modes-label-style-the-_claude-frame-and-making-a-card-owner-2026-11-09)). A page grows sideways, one `Page · 1920` per topic: `Page · Cards` (basics), `Page · Card builder` (voice-app's, 2080; don't touch), `Page · Card types` (5400), `Page · Layout basics` (7480), `Page · Nesting` (9640), `Page · Media` (11800; [details](./doc/use-figma.md)). Drag sources must be direct children of a root GRID frame ([rule](./doc/use-figma.md#traps)).
- **Every page** has a `Page · 1920` copy at (0,0) and a `Main components` column left of x 0 holding the masters, each under a purple `Main component label` (`Colors/main-component`). A master cannot go inside a slot. Keep the wrapper around each master thin and named, so a whole page is easy to select.
- **Root frames are 400, 1920 or 3440 wide** (owner); anything else nests inside one. Fewer one-off, non-component frames.
- **Components page:** `Kicker` (h4 caps: section kickers, status, captions; was `Icon item`), a new `Icon item` (icon 24 + name, for list rows and menus; `Icon button` is the same without the name), and `Input`, `Select`, `Text area`, `Toggle`, `Checkbox`. Inputs are as tall as Button (2 × `btn-pad-y` + 24). Toggle off and Checkbox unchecked are overrides, not variants.
- **Images page:** every portrait has an avatar row (40, 64, 96, 160, rounded square, ring). Avatar rings are outside strokes, so rows that hold them need `clipsContent = false`. Background removal is not possible from the MCP (Weave is not linked to the account); the owner does it in Figma (Actions → Remove background).

## The card system pages (voice-app's, listed 2026-11-10)

Each is a `Page · 1920` at (0,0) with its masters in a `Main components` column at x -560. The UI page's top section, "Map of the card system", links to each. Masters and ids (voice-app owns them; ask before touching):

- **Cards · Buttons & toolbars:** Toolbar `118:423`.
- **Cards · Lists & grids:** List row `126:423`, Divider `126:436`, Tile `126:442`.
- **Cards · Inputs & forms:** Search field `130:423`, Chip `130:432`, Form field `130:440`, Slider `130:451`.
- **Cards · Navigation:** Nav item, Bottom nav, Tab, Tabs, Segment, Segmented control. The `Selection` collection (modes Off/On; variables fg, bg, indicator) marks the selected one: a selected item is just `Selection: On`.
- **Cards · Overlays:** Screen `136:423` (400×860), Sheet, Toast, Menu item, Menu, Keyboard; a second page instance, `Keyboard & screen height`, sits to its right.
- **Cards · Domain cards:** nine cards in a 3×400 masonry.
- **Apps · Tasks, Apps · Chat, Apps · Editor:** flows of 400×860 screens; `Prototype ·` top-level frames sit to the right, wired with `setReactionsAsync` and a flow start.
- **`Page · Card builder`** (on Cards) was rebuilt: 6 starting cards, a masonry drop zone, 12 edge-to-edge rows and 12 padded pieces, all in 400-wide grid columns.

Build lessons from these pages are in [use-figma.md, Traps](./doc/use-figma.md#traps) (card system build lessons).

## The icon system (mine, 2026-11-10)

Page `Cards · Icons` (156:975): `Page · Icons` (166:1383) with sections Icon, Icon frame, Icon item, Alignment test, Pill; masters in the `Main components` column.

- **Icon** (set 156:988): Size H1/H2/H3/H4/Body/Label, one text style each (`Icon/H1`…`Icon/Label`, Material Icons, line height = the text style's); glyph prop `Icon#156:0`. Every master uses it as an exposed nested instance (Kicker, card header, Panel, Icon button, Icon item, Pill, and voice-app's Chip, Tile, Nav item, Menu item, Toast, Search field).
- **Icon frame** (set 162:1856, Small 28 / Medium 37 / Large 46): the small icon button. None, hover and selected are the Selection mode on the instance (Off, Hover, On), not variants. **Icon button** 21:126 stays the large (56) Button-mode version.
- **Icon item** (set 162:11334): icon pinned to the top of the first line, Name FILL, so a long title wraps beside it. **Pill** (set 166:594): icon and label in a rounded Selection-coloured background, per size.
- **Alignment (tested):** a pinned-top row beats an inline glyph (the second line runs under the icon, and uppercase H4 breaks the ligature) and a centred icon (drifts to the middle of a wrapped block).
- **Panel** header is a Label (fill) plus an `Actions` slot for Icon frame buttons; the footer is a Toolbar.
- **Swapping a master's own `Icon` text property for the nested Icon:** record every copy's value first (`setSharedPluginData`; `setPluginData` is not supported here), swap, write the values back, then delete the old property; a deleted property takes its copy values with it. A nested instance's glyph property cannot be bound to the parent's property.
- Gaps: no Small text style (Label stands in), Material Icons has no Outlined weight, Kicker glyph is 14 px (Icon/H4).

## The Page builder page (2026-11-09)

Page `Page builder` (62:933) has exactly two top-level frames, both auto layout (rule: query every top-level node before a layout change; a container is a column of equal-width things or a row of equal-height things, never rows of very different widths; no manual positions inside a frame):

- `Page builder` (96:1800, at 0,0, vertical): `Start` (96:1801, one blank 1920×1080 `Template · Site` instance on the left with two filled copies below it, and a column of all seven blocks beside it; titles 100 to 140, sized to a 1920 row) then `More` (a row of five columns, one per width class: Drag and drop plus the six-block copy `Page · all six blocks` 93:1941; Screens · 1920×1080; Examples plus How to build a page; Templates, 3440; Compare widths plus the master with its 400 and 3440 copies).
- `Main components` (71:518, left of x 0): a row of five columns, one per width (400, 1000, 1600 blocks, 1920, 3440), so no column mixes widths.

- **Templates** (masters; the Content slot carries the padding, bound to `pad-x`/`pad-y`, so the whole area is the drop target, and `Scheme = White` is set on each component; rules in [use-figma.md](./doc/use-figma.md#templates-you-drag-into-owners-findings-2026-11-09)): `Template · Site`, `· App with sidebar` (and `· Full bleed`, slot padding 0), `· Landing` (1920), `· Phone` (400, Resolution Mobile on the root, grids set to one column) and `· Mega` (3440, the sidebar stays Default and only the Main frame is Resolution Mega, slot content max 2880). Blocks: `Block · Three cards / Photo cards / Split / Stats / Call to action / Gallery`.
- **A ground colour is a Scheme mode on the template**, not a copy per colour: duplicate a template and set Prime, White or Light gray. Cards inherit the ground and vanish on a Light gray, Dark or Prime ground, so set `Scheme = White` on each card instance there.
- `Screens · 1920×1080` (82:1363, between Drag and drop and Templates): three fixed-height screens: halves on two grounds (82:1373), a 1600 centred area split into two 800 columns (82:1399), a full-bleed Prime band over a padded area (82:1426). Built from plain frames and White-scheme Card instances, not yet components; two or three columns and a Widths page (one page per root width) are not built. Build notes: [doc/use-figma.md](./doc/use-figma.md) (Traps) and [doc/troubleshooting.md](./doc/troubleshooting.md).
- **Responsive builder (2026-11-09):** the 1920 master `Page builder · 1920 master` (86:1451, a component wrapping the old page copy 71:555) sits in `More` with a 400 copy (Resolution Mobile, 86:1452) and a 3440 copy (Resolution Mega, 86:1603), each under a label. Drop a block into the master's Content slot and both copies show it. The master sits on the canvas, not in `Main components`, because you design in it. `Main components` also holds `Page · 1920` (67:88), `Page` (16:163) and `_Claude frame` (42:157), moved from the Layouts page: `appendChild` across pages works and every instance stays linked.
- **Blocks wrap, they are not grids:** Three cards, Photo cards, Stats, Gallery, Split and the CTA band are horizontal WRAP rows with children FILL and a min width (320 cards, 160 stats and photos), so at 400 they stack (stats and gallery go 2 by 2) and at 1600 they sit in a row. The Split image has `minHeight` 320 so it does not collapse when stacked. Header and Section label text are FILL with max 760, so nothing overflows 400. The Section master (48:601) belongs to the cloud-chat agent; its label fix was reported to it.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- Sept-2026 archive, generated by `node Server/figma-roundtrip.mjs` (counts are Sept-2026; do not hand-edit): [doc/round-trip.md](./doc/round-trip.md) (what came back from Figma into code, every page and variable mapped), [doc/figma-pages.md](./doc/figma-pages.md), [doc/next.md](./doc/next.md) (the first token-sync slice, done)
- [doc/token-sync.md](./doc/token-sync.md) — Figma vs site tokens, measured at 390/1920/3440; `tokens/` turns the Figma variables into opt-in `--fig-*` CSS (`node .../tokens/FigmaTokens.mjs`), and the safe path to one system
- [doc/figma-browser-loop.md](./doc/figma-browser-loop.md) — the design is the spec: Figma frame → code → screenshot diff against the frame (Shots); measuring tools check, never design
- [doc/video-kit.md](./doc/video-kit.md) — planning videos in Figma: 16:9 and Shorts safe zones, responsive title graphics, AI storyboards, the path to Premiere
- [doc/title-layouts.md](./doc/title-layouts.md) — title cards: where 2–5 words go, small filler words, lines that lock together; schematics for 16:9 and Shorts
- [doc/controls.md](./doc/controls.md) — the opt-in `.fig-toggle/check/radio/select/icon` classes coded from DS 2.6, 2.7 and 1.1
- [doc/layouts.md](./doc/layouts.md) — the opt-in `.fig-stack/cols/split/media/side/three/bands` classes coded from DS 4.1, with a container-query phone collapse
- [doc/figma-layout.md](./doc/figma-layout.md) — fill not fixed, no clipping, equal heights and masonry in auto layout (the general rules are in design/layout/doc/space.md)
- [doc/builder.md](./doc/builder.md) — drag-and-drop workspaces: a toolbox matched to each target column's width and ground; items inherit the mode; the `Pages` page is its current form
- [doc/page-layout.md](./doc/page-layout.md) — every Claude page: one 1920 auto-layout wrapper, above the fold first, no Sections; the design system file's page list
- [doc/mcp-servers.md](./doc/mcp-servers.md) — desktop MCP (reads, your selection, about 0.3 s) vs remote MCP (all writes)
- `scripts/` — `index-pages.figma.txt` rebuilds the two Index pages; `contrast.figma.txt` prints live contrast ratios (read-only; ratios are never stored in the design). Run each through `use_figma`.
- [doc/use-figma.md](./doc/use-figma.md) — drawing with `use_figma`: the design system file's collections, Resolution in practice, the bind/mode/compose recipe, card modes, slots, componentizing, grid, traps; [doc/troubleshooting.md](./doc/troubleshooting.md) for dated edge cases
- [doc/icons.md](./doc/icons.md) — the Sept-2026 `Icon` set (glyph components, Size x Style x Fill x Tone) and the rules that hold in both files: the Material name is the identity, the Icons-vs-Symbols trap, handoff to code
- [doc/observations.md](./doc/observations.md) — how the Figma MCP behaves (costs, limits, what failed); keep it current
- [doc/capture.md](./doc/capture.md) — our page into Figma (`generate_figma_design`): works; flex survives as auto layout, one breakpoint per capture
- [doc/figma-to-framework.md](./doc/figma-to-framework.md) — which Figma signal implies which of our layout words, where the signal runs out, the default; what a spec must name (HUG = does not stretch)
- [doc/page-storage.md](./doc/page-storage.md) — how a page's content should be stored (JSONL views vs `page.js`), decided
- [doc/scheme.md](./doc/scheme.md) — the Scheme (was Text) modes and how the rebuilt pages use them · [doc/refined-asks.md](./doc/refined-asks.md) — generated by `Server/AskIndex.mjs`: the owner's asks about this module, Sept-2026 era (do not hand-edit)
- Open threads (linked, not repeated): the page-as-JSONL-views idea is item 5 of [the brief](/framework/ai/sessions/2026/10/10/session-62419663/figma-system/requirements.md), answered in doc/page-storage.md; the "code mastermind" discussion notes live under `ai/` (see `ai/sessions/2026/10/02/standing-voice-pair/requirements.md`)

## Notes from your asks

- Rules, preferences and ideas you said about this module: [doc/notes-from-asks.md](doc/notes-from-asks.md)
