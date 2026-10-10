# Minion brief: AI 2 → tabs Inbox · Overview, and the Overview itself

Load the `minion` skill, then the `page` skill. Your parent is `task-mastermind-ai2-overview`; the whole task is `public/framework/ai/2026-09-28/ai2-overview/requirements.md`. Read the owner's raw words first: `public/framework/ai/2026/09/28/ai-2-rhythm-tabs-sections-and-sidebar-va/owner-words.md`, the "about 10:50 PM" ask for tabs and "Continued (about 11:00 PM)" in full.

> "using the top tabs at the root level, just kind of like a class doc page ... the title, and then some tabs for like inbox, but over then maybe an overview"
> "I need to see simple, big simple interfaces with big simple icons and like the important things are big and then the sub things go inside the big ones"
> "if you have 100% on 20 items it just gets kind of like visually exhausting, you probably just have a completed section"

The owner is exhausted by complexity. **If a choice makes it more complicated, don't make it.** Readable in 10 seconds at 1920 and at 3440.

## Work only in the worktree

`C:\Code\lew42\worktrees\ai2-overview` (branch `worktree/ai2-overview`, server `http://localhost:53155/`, so `http://localhost:53155/framework/ai2/`). Never edit the main tree. Read `public/framework/ai2/readme.md` there first (the Watch-out list has burned agents). Commit by exact path.

**Fence:** `public/framework/ai2/page.js`, `public/framework/ai2/overview.js` (rewrite it; the old four-column overview is retired, decided), `public/framework/ai2/ai2.css`, `public/framework/ai2/readme.md`, `public/framework/ai2/doc/overview.md` (append a "The page" section; a sibling writes its top). Not the json, not the script. Task log: `public/framework/ai/2026-09-28/ai2-overview/ui/task.jsonl` in the MAIN tree.

## The data

`/framework/ai2/overview/overview.json`, built by `Server/ai2-overview.mjs` (a sibling minion writes both; if the json isn't there yet, write a 2-concept sample of this exact shape to your scratchpad and build against it, then switch):

```json
{"built_at":"ISO","unfiled":123,"concepts":[{"id","name","icon","url","open":[ASK],"done":[ASK],"done_count","stale_count","cost_usd"}]}
ASK = {"task","quote","words_url","asked_at","landed_at","hours","cost_usd","outcome","result_url","state"}
```
Concepts arrive in importance order. Fetch it with a URL resolved against `import.meta`.

## Deliverables

1. **Two routed tabs at the top of AI 2, like a class doc page:** the title "AI 2", then tabs **Inbox · Overview**. Inbox = `/framework/ai2/` (today's rail + card, unchanged). Overview = `/framework/ai2/overview/`. Reload and Back land on the same tab. Use the site's own tab look (see how `/framework/core/Page/` draws its tabs; reuse, don't invent). The rail's old "Overview" word goes (the tab replaces it). A card url must still open in the Inbox exactly as before.
2. **The Overview: one big icon card per concept**, in the json's order. The first is the biggest (spans wider); the rest a grid. Each card: big icon, name, "N open · M done", cost. Reuse `ux/Content/Concepts` tiles' look if it fits; minimal new CSS, every rule in a layer, classes prefixed `ai2-`.
3. **Inside each card, its open asks, one row each:** the owner's quote (links to `words_url`), a small state word, a link to the result. Done asks fold into ONE line: "Completed (n)", a native `<details>` that opens to the done rows. No progress bars.
4. **A timeline strip per ask**, shown on hover and on a "timeline" toggle at the top of the Overview: asked (time) → delivered (time), how long, $ cost, the outcome, linked. One line, small.
5. **A line at the top**: "Built <time> from the task logs" and nothing else. No explanatory paragraph.
6. Prove it: headless Playwright shots of `http://localhost:53155/framework/ai2/overview/` at 1920×1080 and 3440×1440, and of the Inbox tab at 1920, reached by clicking the tab, saved in `public/framework/ai/2026-09-28/ai2-overview/ui/` in the MAIN tree. Zero console errors. Look at each shot and write one line per deliverable: done or not, with the shot's name.

No DOM after an `await` (capture the box synchronously). Any process you start: `windowsHide: true`, headless, never the owner's tabs. Budget about $4. When done, end your turn; your parent is woken.

