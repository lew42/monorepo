# Framework rules — presentation, readmes and docs, classes, pages, the live site, traps

Every agent reads [the framework readme](../readme.md) first; it names each rule below in one line. This is the long form, moved here word for word from `CLAUDE.md` on 2026-10-22 ([the move map](../ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md)). Read the section for what you are about to make: a page or a report (Presentation, Pages), a readme (Readmes and docs), a class (Classes), an edit to files the live site loads (The site is live), any front-end code (Traps).

## Presentation — always the overwhelmed newcomer (the owner, 2026-09-05)

Level 1 is one page, mostly above the fold: what the thing is, **shown**; its major parts; the way in; room to breathe. Detail is never removed — it nests one click down, where it belongs, and never sits on the first page. Don't tell the reader what you are about to show them; show it. A report to the owner is one screen of plain sentences with links, never the nitty gritty — "getting reports with details I can't follow doesn't help me at all." A file or module named in a message is a clickable link to its page on the site (`/framework/ux/Dictate/`); the source file (`Dictate.js`) is only a second link. (the owner, 2026-09-24)

**Chat is the headline, not the report** (the owner, 2026-10-07): the owner mostly does not read chat, and long replies make that worse. Reply in 1–2 sentences, never three paragraphs: the most important one first, plus a caveat only if it is truly important; the detail stays in the file, card or `doc/` note, one click down, for when they ask. Anything important or contingent (a block, a decision that waits on them, a risk) goes in chat in a noticeable way AND on the AI board as a `Note:` card, so it survives unread chat.

**How to respond** (the owner, 2026-10-12): short, and the most important point first; usually that is the last thing asked. Each `###` heading names the thing (the class, module or page) so the context is always visible, with its path as inline code on the same line (`### 🧱 Parts `core/Page/parts/``), never a separate code block; put a `---` divider between sections so each one reads as its own block; add one short `#` only for a big reply. Show structure as code: `class AIRail extends Inbox.Rail`, API signatures, never long bodies. Lists are flat and short; cut anything that is not a key point. Icons are rare: status only (✅ done, ⬜ open, ⚠️ risk), placed right next to the words they mark, never one per line. Quote the owner only in a `>` blockquote, and rarely; their topics show through the headings instead.

**Design in Figma first** (the owner, 2026-10-20): a new or disputed view is designed in Figma, at phone and wide widths, and approved there before it is built; a minion draws, the mastermind reviews by screenshot. How: the `figma` skill.

**Show it with the widget, then use words.** (the owner, 2026-09-25: "I don't want to read things. I want to see.") Files → `ext/files` (the tree, and highlighted source on click). An object → its live instances. A layout → a screenshot. A task → its checklist. Words come after the picture, and only as many as it takes.

**Clarity is familiar structure.** (the owner, 2026-09-29) Each heading names its topic and states its gist in one line, so a reader knows what it is before any detail. Items are as few as it takes, most important first; a familiar concept needs no explanation, only its name and a link to its own page. Detail is added only when it changes what the reader does. Pick names that can't be misread, and use the same name every time.

**A name is a name plus its scope** (the owner, 2026-10-03). Where confusion is likely (the Design, Code, AI and Servex systems; UI vs UX vs ext), settle the name AND what belongs under it, and say it once at the top of that system's page: what goes here, what goes next door.

**Route everything.** Any view a click reaches has its own URL, so a reload or a back button lands in the same place.

**Anything that can fail tells the user what went wrong** (the owner, 2026-10-24: "I can't see a damn thing about why. No error."). Every step that can fail (a microphone, a request, a socket, a model) shows the reader, where they are looking, which step failed and the real reason in plain words, so they can diagnose it without opening a console. Three parts make it true:
- **A visible reason, not a silent stop.** A failure changes what the reader sees (a red step, a "not sent" on the bubble, an error line), and the words name the step and the cause ("Servex did not answer session/say in 10 s"), not "something went wrong".
- **Nothing waits forever.** Every request has a time limit, and running out of time is itself a failure with a reason. One unanswered request must never hold up the next ones.
- **The error is logged where its module lives.** A failure becomes one line in `failures.jsonl` in that module's own folder ([ext/ErrorLog](/framework/ext/ErrorLog/)), so whoever follows the module hears it. The goal is pages with zero errors.

The worked example is dictation's Debug tab, one row per step, live: [ux/Dictate/doc/debug-tab.md](/framework/ux/Dictate/doc/debug-tab.md).

**Link every mention, and every page** (the owner, 2026-10-08): the owner browses the website, not the file system, so a file that is not linked will never be found. Every page, doc, readme, report or file you create must be reachable by a visible link from the site (its parent's `children:`/readme index, a card, or an index page). Whenever text names something that exists and has a URL (a page, class, module, session, task, card, model such as `/framework/ai/models`, a file), it is a link, on UI cards and content alike: use the mention system (`ext/Mention`, `#Page` `@agent` `/path`) instead of plain names. Sessions and tasks get proper names; a child session or task lives inside its parent's directory (`parent/child`), not in a flat pile.

**⚠ Still broken, so read this twice (the owner, 2026-10-23):** a page reached only by typing its URL, or linked only from a readme, does not exist for the owner. `/framework/ai/merge/` shipped that way: a readme line, no link on any page. A new page is not done until it is clickable from its parent page's navigation on the live site, and the person who built it has clicked through to it from there.

## Readmes and docs

**Docs point, they don't explain.** Treat this file as the root readme; the core docs index every system and how they stream. This file and every `readme.md` bring a topic to your attention; the detail is in `doc/*.md` beside the module (its Docs tab, at `/<module>/doc/`). A readme is the reader's index: mostly suggestions, minimal direction, past problems named in a line with the doc linked, nothing extra. Every module: `readme.md`, `page.js` (show, don't tell), `doc/`. Nothing crawls — a page exists once its parent's `children:` names it.

**Readmes are the cheap index** (the owner, 2026-10-08): every agent reads this file, then the readmes top-down to the directory it works in, so readmes decide how much context each agent pays for. Each readme is a short index (under about 100 lines): what exists, one line each, when you would load it, and links to deeper `doc/*.md` or sibling readmes. Keep them fresh and short; audit them in a cheap Haiku pass when pace allows.

**The iceberg readme, and a readme as memory** (the owner, 2026-10-08): a parent readme is the tip of the iceberg: a solid index of what is inside (each subsystem, one line on what it is and when you would load it, a link). The base, the details, lives in the child's own readme, and the child does the same for its own children, recursively. The root and `framework/ai` readmes must index every major system (Servex, the dev server, MCP servers, models, VS Code sidebar tabs, browser voice agents, sessions, accounting, transcription, the page system) without explaining them. Each module's readme holds its essence and guiding principles, and an `architecture.md`-style doc beside it holds decisions, linking the original refined prompts; keep both fresh, so the owner's suggestions accumulate in the right place instead of dying with a session.

**Name things, and write `.md` links as files** (the owner, 2026-10-08): when a thing has a good name, give it a page and document it there (what it is, what it means); its readme links to that page and the page can load the readme by default. So always write the plain file path (`doc/flow.md`) in readmes and docs: agents then read the real file and the browser gets the working route.

**Docs hold conclusions; logs hold the record** (the owner, 2026-10-22): a readme or `doc/*.md` states what was decided, what came out of it and what is useful later, once, in plain sentences. The dated detail (each small decision, attempt, request, timestamp) is a line in a JSONL log, and the doc links to it. Which log:

| What happened | Where its lines go | Written by |
|---|---|---|
| work on a task or project | the task's own log: `session.jsonl` in a session's task folder, `task.jsonl` in a module's `tasks/<slug>/` | the item tool (`item`), the `log` tool |
| what a session did, its settings | the session folder's `session.jsonl` | the `log` tool, the session's Settings page |
| a note about a folder that belongs to no task | that folder's `ai/log.jsonl` | the `dir_log` tool |
| an improvement idea for a folder | that folder's `improvements.jsonl` (a repeat adds weight) | the item tool |

Never copy log lines into markdown, and never put a conclusion only in a log: when the work lands, the doc gets the outcome and a link to the log.

- **The readme chain:** read the readmes root to leaf before working in a directory, and again when you move to another one, or start a fresh session there (`/framework/ai/readmes/`).
- **Documentation sanity check & git grounding (the owner, 2026-10-06):** Whenever studying documentation, read the readmes, do a sanity check on whether they make sense or are stale, and do a quick verification. If there's an obvious easy fix, make that fix. Whenever editing code, every agent must properly commit its work with clear attribution so the repo history is the verified truth—never leave loose uncommitted files in the working tree.

## Classes (detail: `public/framework/ai/doc/classes.md`)

**Classes are the structure** (the owner, 2026-10-08): the framework is object-oriented, so lean on classes and instances in code and in documentation. Prefer a class over loose functions or one-off scripts wherever a thing has state and behaviour (many AI-system pieces are not yet classes and should be).

**Write classes, not function bags** (the owner, 2026-10-08): one class per file, the file named for the class (`SessionsPage.js` holds `class SessionsPage`), subclasses where they fit (a page template is a class that extends `Page`, a view extends `View`), and a small helper class may live in its parent's file. Attach helpers to the class (static members) and export the class, not a dozen named exports; no lowercase `*.js` files that export piles of loose functions to be cobbled together. A `page.js` stays tiny: import the class and instantiate it. Keep comments to what is not obvious: one line, ideally a pointer to a doc, never a paragraph; history and lessons go in `doc/` (the owner, 2026-10-12; the `code` skill).

**Show the class, and its live instances** (the owner, 2026-10-08 and [2026-10-24](/framework/ai/sessions/2026/10/20/session-e00f55c9/): "instead of me asking these questions, I don't want you to tell me, I want you to show me"): every system is classes and instances, and a page shows them as the program runs. A page about a class shows its structure first: the class name and icon, the core API, the most important properties (instances of other classes are clickable to their own class card), and who calls it. Then its live instances: for a class with a UI, the rendered view beside a debug view of the instance (a tree/card that renders every property by type), so you watch the data change as you use the demo; for a system that runs in node (a Servex role, the task queue, an agent), a page that lists its real instances and their properties, read from their records. A system used daily that is not yet a class becomes one. Do this for the systems you work on, not as a mass operation; the reviewer asks it of every new or changed class.

**Design the class architecture before you build** (the owner, 2026-10-08): wrong names and a wrong hierarchy are why built things "don't feel right". Before building anything of more than one class, write the class architecture (a short page: each class's name and one-line job, what extends what, what composes what, which one is the system/manager that orchestrates the others) and show it where the owner can see it. Then build the smallest working slice and let the page show the real structure, so a naming or hierarchy mistake is caught early.

**An old way that lingers is marked, or it gets copied** (the owner, 2026-10-28). Agents learn from the code and docs they read, so a legacy API left unmarked turns into new code built the wrong way.
- Mark each superseded API **deprecated** where it's defined: one comment line naming its replacement and linking its migration guide, worded the same everywhere so a search finds them all: `// DEPRECATED (YYYY-MM-DD): use <replacement>. Guide: <path>. Remove when: <condition>.` `node Server/Deprecated.mjs` lists every mark with its live caller count.
- A reader of an old **log line shape** (not an API) is marked too, collected into one named replay shim per class, and kept until a scripted migration has moved the logs; logs are history and are never rewritten by hand.
- Its docs say plainly that it's the old way.
- Give it a **migration guide**: what replaces it, the callers (a census script, never a count from memory), and the steps to move them, scripted.
- Then remove it. Example: `page.children` (`core/Page/Children.js`, a Map-shaped wrapper) is replaced by `page.pages` (a List).

## Pages, cards, review

- **Pages are live (the owner, 2026-10-02):** almost everything we build is a page that updates itself while you watch. An agent that creates or works on a page writes its `page.jsonl` in small steps through the page tools (never hand-written JSON, never a whole-file rewrite), and its first line is posted BEFORE any long step ("researching X"), so the owner can follow the work as it happens. An agent reads a page through the tool that returns its computed current state, not by interpreting the raw lines.
- **Cards:** every task reports on its card on the AI board. The card is what the owner reads; chat replies are not.
- **The page inbox:** a note left on a page reaches the agent that owns it. Use it for coordination, never for content.
- **The review gate and the four widths:** `merge.mjs` refuses a page change with no review report. Pages are checked at 400, 1200, 1920 and 3440 before they land.

## The site is live while you edit it (the owner, 2026-09-19)

The owner works on the running site while agents write to it. Before a batch of writes to files the live site loads, hold every live reload, on every page and every server watching this repo: `node Server/hold.mjs on "<you> — <what>"`, write the whole batch, check it works, then `node Server/hold.mjs off "<you>"` — one reload instead of one per file. A file that parses can still break a page or stop the server from starting: load the page, or boot the server on a private port, before you release. Detail: `Server/doc/watch.md`.

## Traps that never throw

- A class's folder, file and name match, capitalised: `ext/JSONL/JSONL.js` exports `class JSONL`. A lowercase file never holds a class someone will look for. `code/patterns` has the rule and a census script.
  - **The match is for a module's main class:** a capitalised folder `Task/` holds `Task.js`.
  - Small subclasses and helper classes can sit beside it, each in its own file named for its class: `core/Task/Prompt.js`, `Question.js`, `TaskPage.js`. A longer name that starts with the module's name fits the same folder (`ai/AISession/AISessionDetail.js`).
  - A subclass gets its own subfolder only when it needs one: its own tests, a page, docs.
  - This is guidance, not a hard rule: the aim is that anyone can guess where a class lives (the owner, 2026-10-28).
- No DOM after an `await`: capture the box synchronously, fill it in a callback.
- Every CSS rule inside a layer — `base theme site util`; the order lives once, in `framework.css`, which `app.js` loads first.
- Resolve URLs against `import.meta`, never the document.
- Only `p()`/`h1`–`h6` read backticks; one backtick inside `` css(`…`) `` kills every page.
- Imports flow down; a parent↔child import cycle breaks only on deep reload.

## Law: code streams, AI does not (owner, 2026-10-16)

Never rely on an agent to keep the UI current. The UI plugs into raw data (a JSONL file, a log) and code streams the change to the screen. A card an agent has to rewrite is not live. If a view needs an agent to refresh it, the view is wrong: give it a store.
