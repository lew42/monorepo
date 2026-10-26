verdict: fix
1. [fix] The rename broke the concept's own page: `ai/page.js` line 172 still tests `c.slug === "readmes"`, so the "Readme system" concept page has lost its "The chain, live" section (requirement 1: "without breaking the concept's other links"). Change the test to `"readme-system"`.
2. [fix] The chain does not visibly sit beside the grid at wide widths (requirement 3). shots/readmes-worktree/3440.png and 1920.png: the grid takes the left half and the right half is blank, with not even the "Click a folder to see its chain here." prompt. No shot was taken at `?path=Servex/agents`, so the chosen-folder URL and the side-by-side chain are unproven.
3. [fix] The "Chain tokens" and "Own tokens" headers wrap to two lines, and the top line is cut off, at every width (wrapping 1). shots/readmes-worktree/400.png, header row; 3440.png, header row.
4. [fix] At 400 the Folder column shows only "public/i…" and "public/f…", so the one column a reader needs can't be read (sizing). shots/readmes-worktree/400.png, table band.
5. [fix] The title "Readmes" sits flush against the left edge with no page padding, and a big empty gap (about 80px at 3440) separates it from the intro (spacing). shots/readmes-worktree/400.png top band (title at x=0); 3440.png bands 1–2.
6. [note] The measured layout.json describes the wrong page. shots/monorepo-localhost-framework-ai-readmes/ was shot on the main site, which still draws the old concept page (sheet.png). Only shots/readmes-worktree/ shows the change, and it has no layout.json. The spacing, sizing and wrapping answers below are therefore judged by eye.
7. [note] At 1920 the table is not held to `--datagrid-height: 28em`: the full-page shot runs 4000px with the sticky header repeating over the rows. At 3440 it is clipped correctly. shots/readmes-worktree/1920.png.
8. [note] The next slice (the layered view) was recorded only as a log line in session.jsonl, not filed as a child task as the brief asked.
9. [note] At 3440 the intro paragraph runs about 1900px on one line, well past a readable measure. shots/readmes-worktree/3440.png, band 2.

Widths given: 400, 1200, 1920, 3440 for /framework/ai/ and /framework/ai/readmes/ (main site), plus shots/readmes-worktree/ at the same four widths (the shots that show the change).

## Requirements
- 1 "make the folder win (or rename the concept) without breaking the concept's other links" — no — the folder wins (concept renamed to `readme-system`, `readmes` added to `children`), but page.js:172 still checks the old slug, so the concept page loses its live chain
- 3a "a chosen folder needs its own URL, /framework/ai/readmes/?path=Servex/agents" — yes (code only) — ReadmesView reads `?path` and calls `replaceState`; no shot of it
- 3b "the chain should sit beside the grid at wide widths, not under it" — no — `.rm-body` is an auto-fit two-column grid, but the right column is blank in 1920.png and 3440.png
- 5 "use the spacing tokens (--gap, --pad) instead of constants" — yes — ReadmesView.css uses `var(--gap)`, `var(--pad)`, `var(--gap-50)`; the only constant is the 28em grid height
- "shoot the page at 400/1200/1920/3440" — yes — shots/readmes-worktree/ has all four
- "run review.mjs again, answer every finding in session.jsonl" — yes — session.jsonl log 19:30:52 answers rounds 1 and 2
- "land with finish-task" — yes — task.jsonl `landed_at` 19:45:24
- "file [the layered view] as a child task, don't build it" — no — not built (right), but only logged as "Next slice", not filed as a task
## Page structure
- page 1 (the title says what it is) — yes — 1920.png: "Readmes" plus a one-sentence intro
- page 2 (the one takeaway is clear) — yes — the intro says what the numbers mean
- page 3 (the most important thing comes first) — yes — filter, then the table sorted by biggest chain
## Navigation
- navigation 1 (techniques used) — tabs (the AI tab bar), a sidebar (the site menu); the page itself adds no navigation
- tabs — yes — 400.png, one tab row; the Inbox tab is lit, although Readmes is not one of the tabs (inherited from ai/)
- sidebar — yes — unchanged
## Layout
- layout 1 (the layout fits the content) — no — 3440.png: the right half of `.rm-body` is empty
- layout 2 (does it use the screen at wide widths?) — no — empty 52–72% by layout.json, but that was measured on the old page; by eye, the worktree 3440.png leaves about half the content area unused
## Sizing
- sizing 1 (the main content has a readable width) — no — the intro runs unbounded at 3440, and the Folder column is unreadable at 400
- sizing 2 (the component stops at its max width) — yes — the filter is capped at 40em
## Wrapping
- wrapping 1 (nothing wraps that shouldn't) — no — the token column headers wrap and clip at every width
- wrapping 2 (no horizontal overflow) — yes — not measured on the worktree; there is no x-scroll in any shot
## Spacing and padding
- spacing 1 (padding comes from tokens) — yes — `--pad` and `--gap` in the CSS
- spacing 2 (even rhythm between bands) — no — a large gap between the title and the intro; the title has no left padding (400.png)
## Colour and contrast
- colour 1 (text contrast) — yes — dark text on light grey, 1920.png
- colour 2 (hover and active states) — yes — the hover row uses `--darken-1`; the Table/Rail toggle uses the accent colour
## Flow
- flow 1 (reading order top to bottom) — yes — title, intro, filter, table
- flow 2 (the next action is obvious) — no — "Click a folder" leads to a blank panel in every shot
## Words
- content 1 (plain, full sentences) — yes — the intro and readme.md read clearly
- content 2 (no jargon left unexplained) — yes — "tokens (about four characters each)" is explained
- content 3 (short) — yes — one intro sentence; readme.md states its structure, its writer and its reader (law 9)
