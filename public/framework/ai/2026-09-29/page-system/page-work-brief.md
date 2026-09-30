# Minion brief: every page shows its own work, and its parents' (the page AI panel)

Load the `minion` skill first, then `code`, `page`, `layout`, `css`, `content`. Task dir (the whole conversation, the owner's raw words): `public/framework/ai/2026-09-29/page-system/`. Read `owner-words.md` there, and the relayed ask below, before anything else. Then read `core/Page/ai/` (readme, page.js and its docs): it already draws live agents through ux/Content/Object's DefaultView. Build on that; don't start a second one.

The owner's ask (relayed by servex-mastermind-opus, 2026-09-29):
- **Every page gets the full AI and task experience:** its open tasks, in-flight agents, notes and to-dos, shown on the page. Probably opt-in per page type, but the default for new pages.
- **It's hierarchical:** on a deep sub-page, still show the in-flight work of its PARENT pages (collapsed), so going deeper doesn't lose the bigger context. Propose one or two views.
- **Use the Dictate page as the first real example** (`/framework/ux/Dictate/`): an overview of everything the dictation system does, plus what's in flight and what's to do for it (dictation-playground, mobile-nav's mic work, prompt-refine).
- **The question to answer on core/Page/ai/:** do class-doc pages (ext/Doc extends Page) get this automatically, or does each page opt in?

## Step 1: find the data (report in `page-work-data.md` in the task dir, under 40 lines)
How does a page know its work? Candidates: cards whose `page` field names the page url (Servex cards, `mcp__servex__list_cards` / the `/cards` HTTP route), agents whose `page` field is set (`/agents`), task.jsonl files whose card or fence names the module path, and notes or to-dos in page.jsonl. Name the one source that works today, with the exact route or file, and what a page must carry to be found (its url, a module path, a topic). Find the Dictate tasks named above and say how each one could be matched to /framework/ux/Dictate/.

## Step 2: build
- A **`page_work(page)`** function in `core/Page/ai/` (one file, e.g. `work.js`): it draws the page's open tasks, working agents, notes and to-dos, newest first, open before done. Below it, each ancestor page that has work, as one collapsed row per ancestor ("Parent: UX — 2 tasks, 1 agent working"), opening in place. That is view A. **View B:** the same data as a thin strip at the top of the page (counts only, the ancestors as a breadcrumb with counts), opening the full block below on click. Build both; show both on core/Page/ai/ and say which you recommend and why in one line.
- **Opt-in vs automatic:** make it one exported function, `page_work(page)`, that any page places with one line (NOT a method on Page.class.js: another agent has uncommitted edits there), and answer the question in `core/Page/ai/doc/work.md`: whether ext/Doc pages should get it automatically (and how: one line in Doc's default content), with the cost (a fetch per page load) named. Do NOT turn it on for every Doc page; wire it on exactly the two pages below.
- **Dictate:** add it to `/framework/ux/Dictate/` (its page.js): the block in the page's own place, after the overview. If Dictate lacks an overview of everything the system does, add a short Concepts row of what it does (icon tiles, per the `page` skill 5a) above it.
- core/Page/ai/ shows it live for itself, as the second example.

## Fence
`public/framework/core/Page/ai/**`, `public/framework/ux/Dictate/page.js` and `ux/Dictate/readme.md` (one line). Nothing else; ask me for more.

## Proof
`/framework/ux/Dictate/` and `/framework/core/Page/ai/` at 1920 and 3440, reached by clicking from the rail, zero console errors, zero failed requests; shots `shots/work-dictate-1920.png`, `shots/work-dictate-3440.png`, `shots/work-ai-1920.png` in the task dir. On Dictate, the block names at least the dictation-playground task. Commit by exact path only. Every process you spawn sets `windowsHide: true`. Budget about $5. Reply with the hash, the answer to the opt-in question in one sentence, the recommended view in one sentence, and the shot paths, then stop.
