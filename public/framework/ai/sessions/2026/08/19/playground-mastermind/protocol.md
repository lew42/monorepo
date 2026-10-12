# Minion protocol (pasted into every brief of run 5 — read once, obey throughout)

**The three laws (CLAUDE.md):** less is more — ASAP, fastest working version first; clarity is the
one exception — say the important thing simply, link the long doc; prioritize — the most
important thing first, everything reads as a quick scan. New coders are the audience.

**Task protocol.** Your task dir already exists with this brief as `requirements.md`. Before your
first edit run the `new-task` skill (it writes `task.jsonl` line one — `session_id` from
`$env:CLAUDE_CODE_SESSION_ID`, `group` as given, `steps` = this brief's outline). Log findings
as `{"log":{"at","msg"}}` lines in your `task.jsonl` — never a findings.md. Load the `code` skill
before writing JS under `public/`, `css` before substantial CSS, `new-css-class` before a new
class name, `new-page` before a new `page.js`, `layout` before anything with a size. Run
`documentation` then `finish-task` to land. Any skill that misled you → one line in that skill's
`improvements.md` (the `skill-improvement` skill).

**Never:** kill or restart the dev server (it serves `public/` at `http://localhost/`, port 80 —
an outage is seen by the owner); drive the owner's browser tabs (use Playwright headless or the
`site` MCP `shot` tool); `git stash` (the tree is shared with sibling agents — diff, don't stash);
commit or push; edit `CLAUDE.md`; edit anything under `public/framework/ext/Panel/**` (read-only
for everyone this run); edit files outside your fence — if you must, stop and say so in your report.

**Headless recipe (verified today):**
```js
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
const { chromium } = pw;
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = []; page.on("console", m => m.type() === "error" && errs.push(m.text().slice(0, 160)));
await page.goto("http://localhost/framework/ui/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "<scratchpad>/<task>-1.png" });
```
Scratch (scripts, pngs, JSON) goes in the session scratchpad, named after YOUR task
(`C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/fd78d27e-a28b-4bfe-bb68-7a73578f4f05/scratchpad/<task>-*.mjs`)
— it is shared with sibling agents. A png the report shows goes in your task dir.
A Bash/PowerShell call longer than 120 s needs `timeout: 600000`, or the turn ends mid-wait.

**Report** (the `finish-task` landing line): a headline, clickable links to everything produced,
one png when there is one, what was left. Evidence, not essays: numbers, file:line, measurements.
