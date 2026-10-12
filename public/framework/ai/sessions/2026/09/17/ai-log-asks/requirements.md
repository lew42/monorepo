# ai-log-asks — the AI log shows what the owner asked for, as previews, linked to the prompt

**Three laws.** Less is more (ASAP: fastest working version, then improve; show, don't tell). Clear beats brief by far (a newcomer says what a page is for in ten seconds; full plain sentences, basics first). Prioritize (the most important thing first, everything a quick scan).
**Length budget:** the Asks tab is one screen at 1280 for a dozen asks; a card is a title, one line, a status, two links. Your landing report is one screen of plain sentences with links.
**The reader is the overwhelmed newcomer.** Level 1 is shown, not told; detail nests one click down and is never removed.

## The owner's words (2026-09-17)

> the ai log page for this session should show everything i've asked for (summarized, but linking to the original prompt from the session), listed as previews, when possible. Simple, visual, interactive.

> I want to be able to see an item for AI log revamp, for example, and then I can click through that and kind of see what was discussed, what decisions were weighed and made. And so a lot of that decision-making process, I don't want to see it right away. We tend to get into too much detail too early. [...] Iceberg UX (simple -> complex).

> the session logs can even be clicked through, although that navigation and just the rendering and the layout of the conversation needs to be much more of like a chat conversation instead of just like a summary that's just a big text dump and really doesn't have any flow or rhythm to it

> for every requirement that I give you, I need you to make a report that shows me exactly what I asked for. [...] we need to make sure that the original prompt that I'm giving you and all the requirements are adhered to as closely as possible.

The full prompt: `../mastermind-layout-browser/requirements.md`.

## Deliverables (each ticked against the sentence above at harvest)

1. **The `ask` verb.** `ext/JSONL`'s `TaskJSONL` gains `ask`, merged by `id` the way `agent` merges by `task`. Shape (already written, 13 lines, in `ai/2026-09-17/mastermind-layout-browser/task.jsonl` — render THAT data):
   `{"ask": {"id", "at", "summary", "quote", "prompt", "status": "open|building|landed", "tasks": ["<slug>"], "links": [{"url","label"}]}}`.
   `prompt` is the `uuid` of the user line in the session transcript. Document it in `ext/JSONL/doc/task-jsonl.md` and `ext/AITask/doc/manifest.md` (one paragraph each). Remember: a subclass adding a verb adds it to `static verbs` and clears its array in `reset()`.
2. **The Asks tab** on a task page (`ext/AITask/AITask.js`): when a task carries asks it is the FIRST tab and opens by default (Requirements · Report · Session stay). One preview card per ask: a short title (derive from the summary or the id), the one-line summary, a status chip (open / building / landed), a link **"the prompt"** that opens the Session tab scrolled to that message, and the serving tasks as small links to their task pages, with a deliverable link and a picture when the serving task has landed (`links` / a shot in its dir). Simple, visual, interactive: a card is one glance; clicking a card opens level 2 IN PLACE (a details region below the wall, or an expanded card — never a new url): the verbatim quote, the serving tasks with their `outcome` markdown and their `log` lines that carry a decision. That is the "what was discussed, what decisions were weighed" click-through, and it stays hidden until clicked.
3. **The Session tab as a chat.** Today `replay.js`/`message.js`/`feed.js` render a stream. Make it read as a conversation: the owner's messages and Claude's replies as two visibly different surfaces (side, ground, or a small label — one cue, not three), tool calls folded to one line each ("edited 3 files", "ran a script", "spawned an agent") that expand on click, timestamps at a change of minute not on every row, comfortable rhythm (`--flow` between turns; never a wall). Every user message gets `id="m-<uuid>"`; a hash or a `?m=<uuid>` opens the tab and scrolls to it. Add a **prompts rail**: the list of the owner's messages (first line each) beside or above the stream, clickable, so the conversation can be clicked through.
4. **The requirements report** is the ask card's own line: `status` and `n of m tasks landed`, computed from the serving tasks' `landed_at` (read their task.jsonl through the day's manifest the dashboard already warms — see `dashboard.js` `warm()` / `has_page_js()`). No new page: the Asks tab IS the report.

## Where things are

- `public/framework/ext/AITask/` — `AITask.js` (the tabs, 266 lines), `replay.js` (transcript stream), `message.js`, `feed.js`, `feed.css`, `ai.css` (428 lines), `dashboard.js`, `card.js`; `readme.md` and `doc/` first.
- `public/framework/ext/JSONL/` — `JSONL.js` (parse, replay, verbs), `doc/task-jsonl.md`.
- The transcript comes from `~/.claude/projects/c--Code-lew42-monorepo/<session_id>.jsonl` through the dev server (`Server/plugins/`); each user line has `uuid`, `timestamp`, `message.content` (a string, or a list with `text` parts; skip lines whose text starts with `<` — those are system reminders and skill loads, not the owner).
- The run task to render: `/framework/ai/2026-09-17/mastermind-layout-browser/` (session `cfca18c9-a470-4295-a088-a13479fdd040`, prompt uuid `534b8723-d1a1-4eab-a4b6-c1b3a8138351`).

## Rules

- Load `code`, `layout`, `css` before writing; `new-task` before the first edit (your task dir exists: `ai/2026-09-17/ai-log-asks/`; write its `task.jsonl` launch line there); `documentation` then `finish-task` at the end; `skill-improvement` for any skill that misled you (one line in its improvements.md).
- **Fence:** you may write `public/framework/ext/AITask/**`, `public/framework/ext/JSONL/**`, `Server/plugins/*` ONLY if the transcript endpoint must change (say so in your log), and your own task dir. Never `ai/page.js`, never another task's jsonl, never the run task's jsonl (read it; the mastermind writes it).
- **Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`** (search with rg/Glob scoped to the repo). The owner's server (port 80) is NOT running; start your own: `PORT=8091 node server.js` from the repo root, in the background, and kill it when you land. The `ui-test` skill has the headless recipe (Playwright import is `file:///C:/…`; block sockets with `page.routeWebSocket(/.*/)`); viewport 400 / 1280 / 1920 / 3440, screenshots into your task dir (jpeg, small). A hidden tab does not lay out — headless only.
- **Resolve, don't park.** Fix what you find the best way you can, keep it easy to change, write the caveat beside it. "Left open" needs a reason a reader accepts.
- Findings go in your `task.jsonl` as `log` lines; no findings.md. Timestamps from the clock (`date -Iseconds`), never typed. Never write a jsonl with Out-File (BOM).
- Deleting beats adding; fix the cause once. If the existing stream renderer fights you, replace its shape rather than layering on it — but the Session tab must still render every past task's transcript.
- Landing: `outcome` = a headline, the links (the run task's Asks tab, a Session deep link to the prompt), one screenshot, what was left and why. One screen.
