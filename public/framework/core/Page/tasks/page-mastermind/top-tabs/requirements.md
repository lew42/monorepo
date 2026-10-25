Budget: $9

# Top tabs: one row that side-scrolls everywhere, sticky under a header that scrolls away; half the side padding on a phone

Load the `minion` skill first, then `page` (it sends you to the `/framework/design/` readme chain: layout, navigation, content, ui), then `css` and `navigation`. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`).

**The owner (2026-10-24):** the words are in the prompt log, [`ai/sessions/2026/10/20/session-e00f55c9/page.jsonl`](/framework/ai/sessions/2026/10/20/session-e00f55c9/) lines 404 and 406. The task is `top-tabs-one-row-that-side-scrolls-every` in [`../task.jsonl`](../task.jsonl) (its `expected` field). Step 1 already landed as a quick fix: the AI tab bar side-scrolls on a phone (`ai/rail/rail.css`, merge `2865590d4`). Read that diff first: it is the pattern to spread.

## 1. Every tab row: one row that scrolls sideways, never wraps

- The same tab rows appear across the site: the AI tab bar (`ai/rail/rail.css`), the page tabs from [`ext/tabs`](/framework/ext/tabs/) (`ext/tabs/tabs.css`), and the ext/Doc module tabs (`ext/Doc/Doc.css`, `Doc.js`). Find every place that draws a top tab row and log the list (file and selector) before you edit.
- Make them all one row that side-scrolls at every width. Prefer one shared rule over a copy per module (law 6): if the rows already share a class, fix it there; if not, say which one rule you chose and why.
- ⚠ Do not re-add the edge fade that `tabs.css` once had (a gradient at the scroll edges): the owner asked for it to be removed.

## 2. The tab row sticks; the header above it scrolls away

- On a phone, the framework header (the bar with the hamburger, `core/Sidebar/Sidebar.css` around lines 300–320, `position: sticky; top: 0`) should scroll away like normal content, and the tab row should stick to the top of the screen instead.
- On a wide screen, the tab row sticks to the top of the page's scroll in the same way.
- If a side-scrolling strip and `position: sticky` fight (an `overflow` on an ancestor stops sticky), try a CSS-only fix first. If it needs fragile JavaScript (scroll listeners that measure), drop the sticky part, log why, and keep part 1.

## 3. On a phone, halve the side padding

- Today the page pads the sides, and the white cards inside pad again, so a 390 px screen loses a lot of width.
- Find which tokens set that padding (start from `--gutter-x` and the padding tokens in `framework.css`; the `css` skill sends you to them) and whether these pages use the standard token or their own numbers.
- Weigh two options, pick one, and log why: a `slim` modifier that a page opts into, or every page simply getting less side padding on a phone. A rule changed at its source beats a per-page patch.

## Shots

At 390 and 1920, each **unscrolled and scrolled** (scroll far enough that the header has gone and the tabs are stuck), on three pages: [`/framework/ai/queue/`](/framework/ai/queue/) (the AI tabs), a page with ext/tabs tabs (for example [`/framework/ext/tabs/`](/framework/ext/tabs/)), and an ext/Doc module page with tabs (for example [`/framework/core/Page/`](/framework/core/Page/)). Save them as `shots/<page>-<width>-<top|scrolled>.png`. Before-shots of the same pages first (`shots/before-…`). The 390 scrolled shot of `/framework/ai/queue/` is the deliverable.

## Done

- `node --check` every changed JS file.
- Smoke from the main tree shows no FAIL: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs <your worktree> /framework/ai/queue/ /framework/ai/ /framework/ext/tabs/ /framework/core/Page/ /framework/`.
- Bring the readme of each module you changed current (`ext/tabs/readme.md`, `core/Sidebar/readme.md`, and whichever readme owns the padding token), one or two lines each.
- Log `ready: <branch> at <sha> <the tab rows changed; sticky yes/no and how; the padding choice and why; shots>`. Then stop. The mastermind reviews and merges.

## How

- Work in the worktree named in your first message. Commit after each of the three parts.
- Never kill or restart the main dev server or Servex. Headless only, never the owner's tabs. Never stash: diff, don't stash. Commit only your own files (`git add <paths>`, never `git add -A`); leave `files.jsonl` churn alone.
- These rules reach every page, so check a few unrelated pages at 390 and 1920 before you call it done (for example [`/framework/`](/framework/) and [`/framework/core/`](/framework/core/)).
- **Resolve, don't park.** Anything you leave out gets a log line with the reason.
