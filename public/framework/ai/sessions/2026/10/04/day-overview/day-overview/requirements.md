# AI day overview: what was spent, on what, by module

## The ask (owner, 2026-10-03 ~23:00, dictated, verbatim)
> I want definitely like a per day overview, like of how much was spent on what, um, on the spending, let's always break it down by Claude dollars and real dollars, essentially. Um, and then uh, have a structured summary of the major th like things kind of contextualized with, like which modules were worked on. And then when I click on that, it shows for that day what was worked on about the page class or about whatever class or about any page really. So like the page little icon item, the uh, UI can be, uh, you know, a contextual wrapper for anything, right?

Full raw prompt: /framework/ai/2026/10/03/session-60d9def6/ (the Prompt starting "All right, so I want definitely like a per day overview").

## Want
1. **Spend, per day, always two numbers:** Claude $ (subscription usage priced at API rates) and real $ (money actually charged: OpenRouter, any API key). Split by task and by model. Computed by a node script (law 7), never typed by an AI. Start from `node Server/task-cost.mjs --date <day> --dry` (per-task cost already exists) and the model id on each agent (a `/` in the model = OpenRouter = real $).
2. **What was worked on, grouped by module:** for each module touched that day (core/Page, ux/Dictate, Servex, ...), its tasks with their one-line outcomes. Which module a task touched comes from the files it changed (git commits / its `action` log lines), mapped to the module folder.
3. **Click a module → that day's work on it,** shown with the page/module icon item (the same item that already draws a page link with its icon, ext/Mention / the page icon row) acting as the wrapper. One routed URL per day and per module (Route everything).
4. Lives on the day page at `/framework/ai/<date>/` (extend what renders it; do not build a second dashboard). Today, 2026-10-03, is the proof day; yesterday must work too.

## Existing, read first (law 6)
`Server/task-cost.mjs` + `Server/doc/task-cost.md`; the day page (`public/framework/ai/2026-10-03/page.js` and what it imports); `ai/sessions/2026/10/03/day-audit/day-audit.mjs`; page-ai-cost (landed today: the per-page AI cost line); ext/Mention icon links.

## Done when
The 2026-10-03 day page shows the two totals, a per-module list, and a click into one module, screenshotted at 400 and 1920. The numbers match the script's output.

Budget: $8
Model: Sonnet. Fence: the day-page code, a new script under Server/ or the day page's folder, this task dir. Never the mcp__playwright tools.
