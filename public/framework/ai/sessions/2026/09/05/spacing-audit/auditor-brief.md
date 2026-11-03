# spacing auditor — the brief all four share (Sonnet)

You are one of four auditors in the `spacing-audit` program. **You fix nothing.** This pass is evidence:
pictures and numbers, in a shape the other three match exactly, so a judge can rank them side by side.

Read first: the repo's `CLAUDE.md`, `../2026-09-04/mastermind-platform/minion-rules.md`,
and the night's study `../spacing-study/requirements.md` (the method you are extending).
Skills: `new-task` (your own dir, group `design`), `layout`, `finish-task`.

## The owner's words (this is what you are looking for)

> take more screenshots at 3440. our UI is ok.. it's functional, but it's not clean, simple, user
> friendly. i asked you to fix the visual flow, let things breath, and it's ALL TOO CRAMPED. …
> question the spacing between everything … in most cases, we want a few useful levels. I saw on one
> (templates?) page, a very subtle (hardly noticeable) difference in spacing from cramped, to a little
> less cramped, to "display"? … we want small ui for some things, but we need the padding and spacing
> to grow and breath at 3440. i'm looking at these "top, left, right, bottom" link buttons on the
> toolbars page, and they're 981px wide, with about 50px padding on either side. the buttons have
> about 100px of icon/text, and a massive strip of empty. in a balanced design, the padding would be
> more like 100px?

## The setup — read this before you write a line of code

- **A private dev server is ALREADY RUNNING at `http://localhost:8110/`.** It is the manager's, shared
  by all four of you. **Do not start a server. Do not kill any server. Never touch port 80.**
  If 8110 stops answering, say so in your report and stop — do not start your own.
- **Playwright is global, not in `node_modules`.** Import it by file URL from an `.mjs` script:
  `const { chromium } = await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs");`
  Headless only. Never drive the owner's browser.
- **Wait for the page.** `goto(url, { waitUntil: "networkidle" })` then `waitForTimeout(800)` — this site
  builds its DOM in JS after load, and a measure taken too early reads an empty page.
- **Your script lives in the session scratchpad, named after you** —
  `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/e938046a-4711-446c-9b36-6713cd4e869f/scratchpad/spacing-audit-<yourgroup>.mjs`.
  A sibling will overwrite a file called `probe.mjs`. **Take one argument, the round** (`before` or
  `after`) — **you will be asked to run this exact script a second time after a judge changes the CSS,
  and the two runs must be identical in every way but the round.** Report the script path.

## Your pages

Your group letter and page list come in your dispatch message. For every realm/section in your list:
its **landing page plus its first two children** (read the `children:` line in that dir's `page.js`;
children are space-separated names, each a subdir with its own `page.js`). Skip a child with no
`page.js` — a declared child without one 404s and is somebody else's bug, but say so in a `log` line.

## What to measure — the same six things, on every page, at every width

Widths: **400, 1280, 1920, 2560, 3440** (height 1440, except 400 → 900). `deviceScaleFactor: 1`.

Measure inside the **active page root only** (`document.querySelector(".page")`, or the active column's
body if the page is a column page) — never the dev bar, never the sidebar chrome.

1. **Adjacent-pair vertical spacing.** For every run of sibling elements under one parent, the rendered
   vertical distance between one box's bottom and the next box's top; then, for each pair of *adjacent
   gaps*, the ratio larger/smaller. **Excluding grid row-wrap** — if two "siblings" vertical ranges
   overlap they sit in the same row and are not vertical neighbours (the night's study first read a
   uniform 6.8px grid as an 8.2× spike before this correction; do not repeat it). Flag a ratio **> 2.5×**
   and say whether it has a legitimate reason (a heading between them, a `<details>`, a card/section
   boundary, a deliberate pixel grid) or **none**.
2. **The growth test.** Per page: the **median** sibling gap at each width. The headline number is
   median@3440 ÷ median@1280. The viewport grows 2.69× between those two; a page that grows < 1.3× is
   a finding (`kind: "no-growth"`).
3. **Every control.** Every `a`, `button`, `[role=button]`, `summary`, `.chip`, `.tab`, `.paging-item`,
   `.page-preview`, `.page-preview-link` with a rendered box. Record its **width**, its **content ink
   width** (a `Range` over `selectNodeContents(el)` → `getBoundingClientRect().width`), and its
   computed `padding-left`/`padding-right`. Flag it when:
   - width > **3×** its ink width (`kind: "strip"` — the owner's "massive strip of empty");
   - side padding < **0.5em** of its own font-size (`kind: "padding-thin"`);
   - side padding > **20%** of its width (`kind: "padding-fat"`).
   Also record, per page, the **widest** strip and the container that stretched it (the parent's
   `display` + `flex-direction`/`grid-template-columns`) — the judge needs to know whether it is a
   full-width column stack or a grid of full-width cells.
4. **Box padding vs the page's.** For every box with non-zero padding, compare its resolved
   padding-inline to the page column's own (`--page-column-pad-x`, or the `.page` gutter). A box padded
   *more* than the page it sits in is a finding (`kind: "padding-inversion"`).
5. **Text at x:0.** Any element with text whose box's left edge equals the page root's left edge (±1px)
   — text with no inset at all (`kind: "x0"`).
6. **Things that touch.** Two adjacent visible siblings whose rendered vertical distance is < 2px while
   both paint something (a background, a border, or text) (`kind: "touching"`).

## What you produce

Everything below goes in **your own task dir** (`public/framework/ai/2026-09-05/spacing-audit-<g>/`).
Nothing else in the repo is yours to write.

- **The full shot set → the SCRATCHPAD, not the repo**: one viewport jpg per page per width, at
  `…/scratchpad/spacing-audit-<g>/<round>/<slug>-<width>.jpg`, quality 55.
- **In your task dir, `shots/<round>/<slug>-3440.jpg`** — the 3440 shot for every page, **downscaled to
  900px wide, quality 55, target ≤ 80KB**. These are the before/after pairs the audit page will show,
  so the filename slug must be identical between the two rounds: the url path with `/` → `-`, no
  leading or trailing dash (`/imagine/paging/toolbars/` → `imagine-paging-toolbars`).
- **`findings.json` in your task dir** — this exact schema, because four files get merged:

```json
{ "group": "A", "round": "before", "generated_at": "<ISO>",
  "pages": [ { "url": "/imagine/paging/", "ok": true,
      "medians": { "400": 8.1, "1280": 10.8, "1920": 12.0, "2560": 13.1, "3440": 13.0 },
      "growth_3440_over_1280": 1.20,
      "boxes": { "1280": 214, "3440": 214 },
      "widest_strip": { "selector": "a.page-preview-link", "width": 981, "ink": 99, "ratio": 9.9, "parent": "grid / repeat(auto-fill,minmax(14em,1fr))" } } ],
  "findings": [ { "id": "A-01", "kind": "strip|ratio|no-growth|padding-thin|padding-fat|padding-inversion|x0|touching",
      "url": "/imagine/paging/toolbars/", "width": 3440, "selector": "a.page-preview-link",
      "numbers": { "width": 981, "ink": 99, "padding": 50 },
      "detail": "one plain sentence a newcomer understands",
      "reason": null,
      "severity": 5,
      "crop": "shots/before/crop-A-01.jpg" } ] }
```

  `severity` 1–5, 5 = the owner would point at it. `reason` is `null` when there is no legitimate one —
  **a `null` reason is the finding**. Sort `findings` by severity descending.
- **Ten crops.** For your ten worst findings (severity first), a cropped jpg of the offending region
  (≤ 60KB) at `shots/<round>/crop-<id>.jpg`, and a `log` line in your `task.jsonl` for each — one plain
  sentence, the numbers, the crop path.

## Fences

Your task dir and your scratchpad subdir. **No CSS, no page, no framework file, nothing in another
agent's dir.** Never `git stash` / `checkout --` / `reset` / commit / push. Never `find /`. Never spawn
background sub-agents. Budget ~200k tokens.

## Report back in ≤ 10 lines

Your `findings.json` path · your reusable script path · pages measured (and any that 404'd) · the count
of findings by kind · your five worst with their one-line detail and numbers · the median growth
1280→3440 across your pages · anything you were **uncertain** about (a ratio you could not call, a rule
that does not exist yet) — the uncertainties are as valuable as the findings, they are what the judge
is for.
