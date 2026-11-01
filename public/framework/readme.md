# Framework — everything it offers is organized, visual, browsable: find any thing by clicking through previews, and every layout works from mobile to 3440

## Index

- [live](/live/) — the owner's live voice-work feed (lives at `public/live/`, not in this folder)
- [core](./core/) — the seven classes under every page (View, Page, Router, App, Sidebar, Item, List); [how a page renders](./core/Page/doc/how-a-page-renders.md)
- [ext](./ext/) — opt-in addons; core never imports them
- [ui](./ui/) — the template tier: components, one page each
- [library](./library/) — every ui and Figma item in three columns: siblings, the chosen one at full size, its variants
- [catalog](./catalog/) — every page with a demo as a live preview card, plus the class cards
- [ux](./ux/) — the behavior tier: classes you can extend; [every voice and chat surface](./ux/Dictate/surfaces/)
- [styles](./styles/) — the CSS strategy: four layers, one vocabulary
- [web](/web/) — the guide tier, live (it lives at `public/web/`, not in this folder; no readme here)
- [start](./start/) — three files, no build step, a working site (no readme yet)
- [faq](./faq/) — short answers, code first (no readme yet)
- [versus](./versus/) — how this compares with other choices (no readme yet)
- [util](./util/) — small plain helper functions (no readme yet)
- [lab](./lab/) — small browser-feature experiments, each a live demo (today: notifications on Android; [PWA state](./lab/doc/pwa-state.md))
- [dev](./dev/) — local-only live reload and the dev bar
- [research](./research/) — research projects, one folder each; its readme lists them (read one only when your task needs it)
- [ai](./ai/) — the daily working log and task board (its card rail and inbox are AI 2's old code, being migrated in place; `ai2/` itself is retired)
- [audit](./audit/) — the 2026-08-15 doc audit, a dated snapshot
- [old](./old/) — the home page as it stood before the 2026-10-02 sprawl rebuild, kept reachable
- [doc](./doc/decisions.md) — framework-wide decisions and doc-system notes; [doc/rules.md](./doc/rules.md) is the long form of the rules below

## The systems (one line each; each links its own readme)
- [core/Task](./core/Task/) — `class Task extends Item`: one task's state machine, plus the task pages
- [core/Test](./core/Test/) — node tests: `X.test.mjs`, one command runs the ones a change covers, results at `/framework/core/Test/`
- [core/Page/ext/Inbox](./core/Page/ext/Inbox/) — `class Inbox`: one ranked rail of notes, questions and tasks, read from `page.jsonl` and the AI files
- [core/Page](./core/Page/) — the page system: a folder with `page.js` and/or `page.jsonl`, written by the page tools
- [ai/tasks](./ai/tasks/) — the task log and board: where tasks live on disk, how `Server/AIIndex.mjs` folds them into `ai/index.json`
- [ai/sessions](./ai/sessions/) — one folder per Claude session, by date, and the grid that lists them
- [ai/AITask](./ai/AITask/) — the task viewer classes on the AI pages
- [servex](./servex/) — the always-on process that runs agents: spawning, roles, dispatch (code in `Servex/`)
- [Servex MCP](./ai/doc/agents/mcp.md) — the local `servex` MCP at `/mcp` and the remote door at `/mcp/remote` (`Servex/MCP.js`, `Servex/ext/remote/RemoteMCP.js`)
- [Cloud voice agent](/Servex/ext/remote/doc/cloud-voice-agent.md) — the voice app's call into Servex: `ask_mastermind`, `/live/`, its session record

## Rules — every agent reads these (long form: [doc/rules.md](doc/rules.md), moved from CLAUDE.md 2026-10-22)

- **Presentation — always the overwhelmed newcomer:** level 1 is one screen, shown not told; detail nests one click down. **Chat is the headline, not the report:** reply in 1–2 sentences, the most important first; anything contingent also goes on the AI board as a `Note:` card. **How to respond:** a `###` heading per thing with its path, `---` between sections, icons for status only.
- **Design in Figma first; show it with the widget, then use words.** Clarity is familiar structure; a name is a name plus its scope.
- **Route everything; link every mention, and every page:** every view a click reaches has a URL; every file you create is reachable by a visible link; anything named that has a URL is a link (`ext/Mention`).
- **Anything that can fail tells the user what went wrong:** the failed step and its real reason, visible where the reader looks; every request has a time limit; the error is one line in its module's `failures.jsonl` ([the rule](doc/rules.md)).
- **Readmes and docs:** docs point, they don't explain. A readme is a short index (under about 100 lines), read root to leaf before you work in a folder: `readme.md` is the index, a sibling `<topic>.md` holds an often-read topic, `doc/` holds everything else. No dated logs in readmes; edit what is there instead of transcribing the owner; the mastermind owns its area's docs ([the rule](/.claude/skills/documentation/SKILL.md)). Write `.md` links as file paths; fix a stale readme the moment you notice it.
- **Classes:** classes are the structure; one class per file, named for the file, no function bags; every system is classes and instances, and a page shows the class and its live instances and properties as the program runs (a system used daily that isn't a class becomes one); design the class architecture before you build; **every class gets one lean core test** (`X.test.mjs`: one instance, the top ~50% of its work, an assert per call, under 1 s; [core/Test](./core/Test/readme.md)).
- **Pages, cards, review:** pages are live, written in small steps through the page tools, the first line before any long step; every task reports on its card; `merge.mjs` refuses a page change with no review report; check at 400, 1200, 1920 and 3440.
- **The site is live while you edit it:** `node Server/hold.mjs on "<you> — <what>"` before a batch of writes the site loads, `off` once it works.
- **Traps that never throw:** a class's folder, file and name match; no DOM after an `await`; every CSS rule inside a layer; resolve URLs against `import.meta`; only `p()`/`h1`–`h6` read backticks; imports flow down.
- **Law: code streams, AI does not:** a view plugs into raw data (a JSONL file, a log) and code streams the change; a card an agent has to rewrite is not live.

## Use
```js /path/page.js
import { p } from "/app.js";
p("Hello world.");
```

## Watch out
- Capturing is synchronous: a factory call textually after an `await` appends to the wrong captor — capture the container first, fill it in a callback: [`core/View/doc/capturing.md`](/framework/core/View/doc/capturing.md)
- Every stylesheet restates the full `@layer base, theme, site, util;` and every rule sits in a layer — one short list silently reorders the cascade: [`styles/doc/cascade.md`](/framework/styles/doc/cascade.md)
- `core/` and `core/new/` both ship — a typo'd import path resolves to a same-named *different* class; `instanceof` fails, nothing throws: [`doc/decisions.md`](./doc/decisions.md)
- A POJO page whose key collides with a `Page` method (`render`) shadows it and returns nothing — `content()` is the seam: [`doc/decisions.md`](./doc/decisions.md)
- `instantiate()` is unawaited in the App constructor — a throw outside `load()` is a silent unhandled rejection: [`doc/decisions.md`](./doc/decisions.md)
- Rename freely inside `framework/`, alias on the way out — the sandboxes' `lib/` are downstream packages: [`doc/decisions.md`](./doc/decisions.md)

## More
- [Overview](/framework/) — then [Start here](/framework/start/), [FAQ](/framework/faq/), [Versus](/framework/versus/)
- [`core/`](/framework/core/) — seven classes, every page
- [`ext/`](/framework/ext/) — opt-in addons; core never imports them
- [`styles/`](/framework/styles/) — four layers, one vocabulary
- [`ui/`](/framework/ui/) — nineteen components, four bands
- [`web/`](/web/) — the guide tier, live
- [`dev/`](/framework/dev/) — local-only live reload
- [`util/`](/framework/util/) — small plain helpers
- [`ai/`](/framework/ai/) — the AI system: every AI agent reads [ai/readme.md](ai/readme.md) for the lay of the land; the working log, daily
- [`doc/decisions.md`](./doc/decisions.md) (the record) · [`doc/injection.md`](./doc/injection.md) (nothing reads `window.app`) · [`doc/theme-behaviour.md`](./doc/theme-behaviour.md) (a theme is CSS)
- [`doc/docs-system.md`](./doc/docs-system.md) (what a doc page is made of) · [`doc/reachability.md`](./doc/reachability.md) (the crawl + audit method)
- **Decisions:** a module's readme gives the one-line overview and links `doc/architecture.md` for the conclusive decisions and why; `doc/decisions.md` (the log) is history, read when you need to know how a decision moved ([shape](/.claude/skills/documentation/architecture-template.md))
- Files that matter: `/app.js` (the one import), `page.js` (sidebar + walls layout), `framework.css` (the utility vocabulary)

## Also here (readme audit, 2026-10-13)
- [audio](./audio/) — microphone building blocks: MicStream, Recorder, Whisper
- [code](./code/) — code in the framework: patterns, dos and don'ts
- [design](./design/) — layout, color, navigation, content and UI decisions
- [servex](./servex/) — the always-on process: runs agents, starts servers, owns logs
- [sources](./sources/) — source library wall of topics, each with a file browser
