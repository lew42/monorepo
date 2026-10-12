# Screenshot system: shots live with their page, automatic for UI work, diffed, and browsable (mastermind brief)

**Owner (2026-10-12, dictated):** we haven't been taking screenshots, so UI ships broken (today: the Figma colour scheme). Screenshots must be built into the page and templating system, at the component level, and automatic, not something an agent has to remember.

## What the owner wants
- **Where shots live:** in each page's directory, in a `screenshots/` subfolder, gitignored site-wide. The server can serve them, and the site can browse them. A page without its own directory gets a data directory that references the subpage by path.
- **Resolutions per template:**
  - a `resolutions` list, or one derived from `optimalWidth` ([ui-library](../ui-library/requirements.md));
  - a mobile button needs only 400;
  - a responsive layout needs all widths;
  - something capped at max-width shows nothing new past its cap.

  **Open question, decide it:** shoot every width below the optimal one too? Narrow means tall: a full website at 400 can be 4,000–10,000 px long. Pick a rule (e.g. cap height, or shoot the first screen plus the full page) and record the alternative.
- **Visual diff:** compare before and after (and more than two shots), region by region, by how much the colour changed. Output an overlay image that shows where things changed, to help the model interpret ("the padding grew here").
  - Reading two similar images may not give the model an accurate diff, which is why the overlay matters.
  - Look for past work on the **linearity filter** (it found lines with good confidence).
  - **No new npm dependency** without asking (CLAUDE.md). Playwright's own screenshot comparison or a hand-rolled one is fine. Measure whether the overlay actually helps.
- **Who does what:**
  - the mastermind orchestrates the shots (Playwright is tricky): it takes them, reads them (reading images is cheap) and judges better or worse;
  - Haiku may suggest fixes;
  - node does everything procedural.

  The system has a **name and its own log** of every run.
- **Automatic for UI tasks:** when a task touches HTML, CSS or a page, the shot → read → judge → fix → re-shoot → compare loop is triggered or strongly prompted by the task process (coordinate with [step-runner](../step-runner/requirements.md)), not remembered. Approved structured content (documented content blocks) needs no review.
- **The owner is the final judge:**
  - a **Screenshots tab** in the dev shell sidebar on any page that has shots, showing the history over time as a tree of rounds;
  - a one-click "better / not better" for the owner;
  - changes compared there must be substantial (small vs large padding), never 2 px.
- **Later (record, don't build yet):** parallel refinement, where several agents try variants and the best is picked.

## The design principle the shots check (record in the docs)
The default clamped padding token should work in about 90% of places: a container either has padding or it doesn't, so we stop thinking about padding. Compact or spacious remaps come later. Aim for 80/20 or better: less CSS, without breaking things.

## Order
1. Past work (`past-work` skill): `ext/DesignTool/vision/` (the ScreenshotTool), `site` MCP `shot`, `check_page`, the four-widths gate in `merge.mjs`, the layout-check, the linearity work.
2. `plan.md` and the architecture.
3. Smallest slice: `shot <page> [widths]` → `screenshots/` + diff overlay + the sidebar tab, run on the Figma pages (pair with @mastermind-figma-colors-fix).

Opus 5.5 for design, Sonnet to build; keep your context under 100k. Worktree; smoke clean; commit each step; merge. `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.
