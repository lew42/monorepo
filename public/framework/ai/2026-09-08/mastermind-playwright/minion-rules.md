# Minion rules — every brief in this run assumes you read this first

Three laws (CLAUDE.md): **less is more** (as simple as possible, fastest working version first, show don't tell) · **clear beats brief, by far** · **prioritize** (most important first, everything reads as a quick scan). CLAUDE.md outranks this file and every brief.

## The owner's laws — they outrank the length budget in your brief
- **Clear beats brief, by far.** Explain like the reader is five. Start with the basics in full, plain sentences; say the one thing a page is for at its top; a demo or a snippet must make its takeaway obvious. Detail that can move somewhere better moves there with a link. Clipped fragments, undefined words and jargon standing in for an explanation are defects.
- **Always the overwhelmed newcomer.** Level 1 is one screen, mostly above the fold: the thing shown, its parts, the way in, room to breathe. Detail nests one click down; it is never on the first page and never deleted. Don't tell the reader what you are about to show; show it. Delete matter-of-fact blockquotes. Demos and reports are held to this harder than docs.
- **Demos do not persist.** A refresh resets a demo to the page it is. Only an editor saves, and it must be visually obvious that it does.
- **Resolve, don't park.** A problem you find is yours to fix the best way you can now, kept easy to change, with its caveat written beside it. "Left open" needs a reason a reader accepts (an owner's decision, a fence, a missing fact) — never "out of scope".

## Before the first edit
- Run the `new-task` skill. Your task dir already exists at `public/framework/ai/2026-09-08/<your-slug>/` with this brief beside it; write `task.jsonl` there (the group your brief names), append the day line to `public/framework/ai/2026-09-08/day.jsonl`. Timestamps come from `date -Iseconds`, called right before each append, never typed from memory.
- Findings go in your `task.jsonl` as `log` lines. Never a `findings.md`.
- Load the `code` skill before writing JS under `public/`; `new-page` before any `page.js`; `css` before any substantial CSS; `new-css-class` before any new class name.

## Never
- **Never kill, restart or start the dev server on port 80.** None is running tonight; the owner starts it in their own terminal. **A read-only server is already up at `http://localhost:8123`** (the mastermind's, pid 25864): use it to look at any page of this site — it serves the live tree and regenerates `directory.json` when a dir appears. Never kill it, never restart it. Start your own only if your brief says so: `PORT=809x node server.js` from the repo root (`netstat -ano | grep LISTENING | grep -E ":80(8|9)[0-9]\s"` lists the taken ones) and kill THAT PID when you land — by the pid you started, never by name or port pattern.
- **Never drive the owner's browser tabs.** Headless Playwright only.
- **Never `git stash`, `git checkout --`, `git reset`, `git rm`, commit or push.** The tree is shared with other agents in flight. Diff, don't stash; delete with `rm`.
- **Never `find /`** or any search outside the repo — scope Glob/rg to the repo. Root scans burned a core for hours, three times.
- **Never spawn background sub-agents** to search or dig for you — their completion routes to the main session, never to you, and you park forever. Dig in the foreground with your own WebSearch/WebFetch.
- **Never write a secret anywhere.** If you meet an API key or bearer token, do not copy it into any file, log or page.
- Never write in another agent's dir or outside your fence.

## Playwright — verified tonight
- **The import:** `import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";` then `const browser = await pw.chromium.launch();` in an `.mjs` script. Verified 2026-09-08 00:00 against https://example.com/ (200, 3.3 s, screenshot written). Never search the disk for it. Two working scripts to copy from: `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/080bcce3-f367-4e60-9a6b-dc6f0a5d45ff/scratchpad/mm-external-probe.mjs` (load + shot + headers) and `mm-scan-probe.mjs` beside it (CSS capture + computed styles + media queries).
- **Scripts live in the session scratchpad** (`C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/080bcce3-f367-4e60-9a6b-dc6f0a5d45ff/scratchpad/`), named after your task (`<slug>-probe.mjs`) — the scratchpad is shared by every agent tonight — unless your brief says the script is a deliverable.
- **External sites are allowed, headless only.** One load per site per width; `waitUntil: "load"` then a 1500 ms settle (`networkidle` hangs on sites that long-poll); 45 s timeout; a site that fails twice is logged and skipped, never retried in a loop. Never log in, never submit a form on someone else's site, never fetch more pages of a site than your brief names. Set a plain user agent string only if a site refuses the default; never disguise as a search engine.
- **The CSSOM is blocked cross-origin.** On a real site `styleSheet.cssRules` throws for every external stylesheet (stripe.com: 5 of 5). Capture CSS with `page.on("response", …)` filtered on `content-type: text/css`, plus inline `<style>` text; `getComputedStyle` on elements works and IS the cascade result.
- **Screenshots are jpeg** (`type: "jpeg", quality: 70`) at 400×844, 1280×800, 1920×1080 and 3440×1440 viewports, plus one 1280×4000 viewport shot named `long`; never `fullPage: true` on a 3440 viewport. **Look at what you shot with the Read tool** before you describe or tag it — the picture and the scan are the evidence; your memory of a site is not.

## The layout names — shared by every brief
- **A layout's id is `N-name`:** N is the number of columns at the widest, the name says how the room is divided (a number only when no name can be found). Names are CSS-agnostic. The CSS technique is a separate tag (`2 column flex`, `2 column grid`); padding, gap, background and colour are further tags.
- **Seed words:** `1-flow` (one column, rows follow each other, each full width) · `1-centered` (one column of limited width with margins either side) · `2-equal` · `2-sidebar` (a narrow column beside a wide one; `left`/`right` is a tag) · `3-equal` · `3-holy-grail` (narrow, wide, narrow) · `N-cards` (N equal columns, each a card: a visible background with padding; a gap is usual, not required). `/layouts/` is the encyclopedia; when it lands, its `layouts.json` is the authority and these are its first entries.

## Waiting
- If you must wait on something, loop in chunks under the Bash tool's 120 s default (`timeout: 600000` on the call, or `Start-Sleep 15` in a loop) — a wait that exceeds the timeout backgrounds and ENDS your turn.

## Landing
- One line in the misled skill's `improvements.md` when a skill let you down (the `skill-improvement` skill; thirty seconds). Mandatory when it happened, forbidden when it did not.
- `documentation` skill if you touched a module; `finish-task` skill to land: landing line with `outcome`, every deliverable in `links`, day log closed.
- Report in plain sentences, one screen at most, every claim with a clickable. Tokens honestly; "none found" is a valid, complete result.
