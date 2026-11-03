# Check 23 asks against the repo: ext/Figma

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/02-ext-figma-2/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ext/Figma`, folder `public/framework/ext/Figma` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ext/readme.md`, `public/framework/ext/Figma/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ext/Figma/readme.md`)

# Figma — tracks Figma files as JSONL + saved screenshots, so the site can browse every page and rebuild designs without Figma

## Use

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

- No tool lists a user's files: every fetch needs a file key from a Figma URL. Tracked now: Sept-2026 `QYN0G2URSBHYH5I06MOjxU`.
- Sept-2026 is now also our design file (owner, 2026-10-12): Claude may add pages to it (`Claude · Overview` is the index) and its `prime` variable is the site's `#FF6157`. Leave the owner's own pages (1–8, Vector, Paragraph) as they are. July-2026 stays read only. Load the `figma-use` skill resource before any `use_figma`.
- **The process** (owner, 2026-10-12): design in Figma with the tokens and kit, click through it, approve it, then code it from the approved frame, so there is something tangible to revert to instead of a description.
- **Figma mastermind** (owner, 2026-10-13): one standing session owns the Figma work and keeps this folder's docs current. Figma work needs no worktree; repo edits (docs, `tokens/`) still commit by path, and `tokens/` still goes through review and merge. Pages follow [doc/page-layout.md](./doc/page-layout.md) (one 1920 wrapper, auto layout, the page as a component, an Index page). Edit the main component, never the same override on every instance.
- Screenshots over 600 KB are refused by `track.mjs`; the Figma screenshot URL is short-lived.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [doc/round-trip.md](./doc/round-trip.md) — what came back from Figma into code, every Figma page and variable mapped (`node Server/figma-roundtrip.mjs`), and whether to mock up in Figma; first sync slice in [doc/next.md](./doc/next.md)
- [doc/token-sync.md](./doc/token-sync.md) — Figma vs site tokens, measured at 390/1920/3440; `tokens/` turns the Figma variables into opt-in `--fig-*` CSS (`node .../tokens/FigmaTokens.mjs`), and the safe path to one system
- [doc/figma-browser-loop.md](./doc/figma-browser-loop.md) — the design is the spec: Figma frame → code → screenshot diff against the frame (Shots); measuring tools check, never design
- [doc/video-kit.md](./doc/video-kit.md) — planning videos in Figma: 16:9 and Shorts safe zones, responsive title graphics, AI storyboards, the path to Premiere
- [doc/title-layouts.md](./doc/title-layouts.md) — title cards: where 2–5 words go, small filler words, lines that lock together; schematics for 16:9 and Shorts
- [doc/controls.md](./doc/controls.md) — the opt-in `.fig-toggle/check/radio/select/icon` classes coded from DS 2.6, 2.7 and 1.1
- [doc/layouts.md](./doc/layouts.md) — the opt-in `.fig-stack/cols/split/media/side/three/bands` classes coded from DS 4.1, with a container-query phone collapse
- [doc/file-map.md](./doc/file-map.md): what is on which page of the Sept-2026 file, one line each
- [doc/figma-layout.md](./doc/figma-layout.md) — fill not fixed, no clipping, equal heights and masonry in auto layout (the general rules are in design/layout/doc/space.md)
- [doc/builder.md](./doc/builder.md) — drag-and-drop workspaces: a toolbox panel matched to each target column's width and ground; items inherit the mode
- [doc/page-layout.md](./doc/page-layout.md) — every Claude page: one 1920 auto-layout wrapper, above the fold first, the page as a component, an Index page
- [doc/mcp-servers.md](./doc/mcp-servers.md) — desktop MCP (reads, your selection, about 0.3 s) vs remote MCP (all writes)
- `scripts/` — `index-pages.figma.txt` rebuilds the two Index pages; `contrast.figma.txt` prints live contrast ratios (read-only; ratios are never stored in the design). Run each through `use_figma`.
- [doc/use-figma.md](./doc/use-figma.md) — drawing with `use_figma`: the file's tokens (Colors, Text modes, Resolution incl. Mega = 3440, text styles), the bind/mode/compose recipe, traps (Consolas missing)
- [doc/icons.md](./doc/icons.md) — the `Icon` component: 54 glyph components in 6 categories, an Icon set (Size x Style x Fill x Tone) with a glyph dropdown, an Icon label row, how to add an icon
- [doc/observations.md](./doc/observations.md) — how the Figma MCP behaves (costs, limits, what failed); keep it current
- [doc/capture.md](./doc/capture.md) — our page into Figma (`generate_figma_design`): works; flex survives as auto layout, one breakpoint per capture
- [doc/figma-to-framework.md](./doc/figma-to-framework.md) — which Figma signal implies which of our layout words, where the signal runs out, the default (supersedes [doc/mapping.md](./doc/mapping.md))
- [doc/haiku-builds.md](./doc/haiku-builds.md) — what Haiku got right and wrong, per Palette section
- [doc/page-storage.md](./doc/page-storage.md) — how a page's content should be stored (JSONL views vs `page.js`), decided
- Open threads (linked, not repeated): the page-as-JSONL-views idea is item 5 of [the brief](/framework/ai/sessions/2026/10/10/session-62419663/figma-system/requirements.md), answered in doc/page-storage.md; the "code mastermind" discussion notes live under `ai/` (see `ai/sessions/2026/10/02/standing-voice-pair/requirements.md`)


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/02-ext-figma-2/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 23 asks

1. `a959707ee1` (4 days old): Build a mobile UI kit as the home for the elements, and verify each works on mobile.
2. `c7aead1ec4` (4 days old): Spawn Sonnet minions to walk the website elements and build a component system in Figma.
3. `d7e7476d07` (4 days old): Decide whether everything should be a component.
4. `3cec3f3f1b` (4 days old): Decide what should and should not be a component, and how to convert those into actual UI.
5. `dc2f8037dd` (4 days old): Figure out how Figma slots work and whether they solve container problems, since components cannot hold arbitrary content.
6. `382da051a0` (4 days old): Make design-system suggestions.
7. `97c53273b5` (4 days old): Create an overview page in the September 2026 folder (owner's name; today is October 2026), possibly a runnable prototype the owner can click through.
8. `08e6c54d58` (4 days old): Add text layers in Figma that link to other pages and work outside prototype mode, for multi-page navigation.
9. `508130d0a4` (4 days old): Work on layouts and Figma title-card design, with title casing as one factor
10. `3f9e33ef13` (4 days old): Study Netflix and Amazon Prime Video title cards for reference
11. `67c4e70c36` (4 days old): Build raw text layouts for two, three and five word titles, showing where the text goes
12. `442c0ad13a` (4 days old): Auto-layout two-line titles with the top line bottom-aligned and the bottom line top-aligned
13. `20cd13766b` (4 days old): Make filler words like the, of, a smaller and place them strategically so main words carry weight
14. `3603fcb547` (4 days old): Try centered, left or right, top or bottom, or combined alignments
15. `81edc1b368` (4 days old): Explore how word count and filler size change overall positioning and composition
16. `985bd08996` (4 days old): Explore these text layouts for mobile and video presentation cards
17. `05753355a4` (4 days old): Identify which size and style combinations work well together
18. `ba3733d783` (4 days old): Build robust reusable layouts combining alignment, size, scale and positioning
19. `2bc044bb36` (4 days old): Judge how filler-word alignment reads from a bird's-eye view against bigger words
20. `a576963397` (4 days old): Create a 1920x1080 long-form video layout kit in Figma with title slides and presentation layouts
21. `16f2dd4d89` (4 days old): Create shorts layouts that respect safe zones, with buttons and chat kept clear of visuals and text
22. `3955b769cb` (4 days old): Produce a responsive video schematic covering mobile shorts and desktop, with full HD graphics reused for long-form
23. `04bd20e66f` (4 days old): Create an AI-generated storyboard about Jesus and the 12 apostles
