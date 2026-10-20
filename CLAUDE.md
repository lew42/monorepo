# CLAUDE.md

Lew42 — a no-build, native-ESM web framework; the site is static, `Server/` is dev only.
This file rules; skills and readmes elaborate it. **Do not edit it without asking.**

Consolidated 2026-10-12: text moved out of this file lives in a linked doc, and `public/framework/ai/doc/claude-md-archive.md` keeps the original wording of every rule that was reworded. The sentence-by-sentence map is in `public/framework/ai/2026-10-12/claude-md-consolidate/`.

## Laws

1. **Less is more — ASAP, As Simple As Possible.** Fastest working version first, then improve. Show, don't tell — a demo you can open beats a description. Question every word, line, section. Deep docs may breathe.
2. **Clear beats brief — by far.** Simple, but clear: explain it like I'm five. Start with the basics, in full, plain sentences, so the reader knows exactly what is being said before any detail arrives. Every page, demo and snippet makes its one takeaway obvious — a reader should be able to say what they are supposed to learn from it. Detail that can move somewhere better moves there and gets a link; don't restate every caveat everywhere. An extra sentence that clarifies a necessary point belongs. "Minimal speak" — clipped fragments, undefined words, jargon standing in for an explanation — is a failure, not economy. New coders are the audience. (the owner, 2026-09-04)
3. **Prioritize.** Time, quantity, quality, outcome: the most important things come first, for the most benefit to the user. Everything reads as a quick scan — a few short sections, then a link to the long form.
4. **Follow the owner's words.** Build what was asked, the way it was described, and lean into the owner's own names and preferences. Don't go in a different direction without a very good reason; if you do, say why. (the owner, 2026-09-30)
5. **Keep working; never wait on the owner.** Make the best decision, say what the alternative was, and keep going. Never create a request that blocks on the owner: they may never see it. If a limit stops you, queue the work and pick it up after. Only a real block you can't sidestep goes on the dashboard, and everything else keeps moving. Don't do anything dangerous. (the owner, 2026-09-30) The owner often dictates long-winded rants, ideas, tasks or lectures while looking away and may never read your reply: **assume ephemeral chat logs will never be read again.** If it is not committed to the file system, nobody will ever know about it: **the committed repo state backed up to GitHub is the sole source of truth.** Never leave loose ends hanging on the assumption of a follow-up. If there is a safe, quick fix, attempt it; if not, **record the essence of the dictation immediately in the proper place** (notes, legitimate questions, tradeoffs or implications): a short `doc/*.md` file beside the relevant module, linked from that directory's `readme.md`. Files are what survive. (the owner, 2026-10-01, updated 2026-10-05)
6. **One of everything; don't repeat yourself.** Before you build, find what already exists and use it, or extend it. Never build a second version of a system. Every surface that shows the same thing (a chat, a sidebar, a card, a rail) uses the same component, so one fix updates all of them. (the owner, 2026-09-30)
7. **Compute, don't recall.** Anything a computer can work out (state, counts, costs, which tasks landed, log lines, records) is done by a node script or tool that reads the real state, never written by an AI from memory. AI handles judgment; record-keeping is code. (the owner, 2026-10-01)
8. **Name it and home it first.** Every new module or task settles its name and home location first. (the owner, 2026-10-16)
9. **Document the structure as you build.** Every system's readme states what it is, its exact on-disk structure, which tool writes its data and from where, and which class reads it — verified against the code, no history. If an agent had to investigate to learn how a system works, the readme failed; fix the readme in the same task. (the owner, 2026-10-19)

## Presentation — always the overwhelmed newcomer (the owner, 2026-09-05)

Level 1 is one page, mostly above the fold: what the thing is, **shown**; its major parts; the way in; room to breathe. Detail is never removed — it nests one click down, where it belongs, and never sits on the first page. Don't tell the reader what you are about to show them; show it. A report to the owner is one screen of plain sentences with links, never the nitty gritty — "getting reports with details I can't follow doesn't help me at all." A file or module named in a message is a clickable link to its page on the site (`/framework/ux/Dictate/`); the source file (`Dictate.js`) is only a second link. (the owner, 2026-09-24)

**Chat is the headline, not the report** (the owner, 2026-10-07): the owner mostly does not read chat, and long replies make that worse. Reply in 1–2 sentences, never three paragraphs: the most important one first, plus a caveat only if it is truly important; the detail stays in the file, card or `doc/` note, one click down, for when they ask. Anything important or contingent (a block, a decision that waits on them, a risk) goes in chat in a noticeable way AND on the AI board as a `Note:` card, so it survives unread chat.

**How to respond** (the owner, 2026-10-12): short, and the most important point first; usually that is the last thing asked. Each `###` heading names the thing (the class, module or page) so the context is always visible, with its path as inline code on the same line (`### 🧱 Parts `core/Page/parts/``), never a separate code block; put a `---` divider between sections so each one reads as its own block; add one short `#` only for a big reply. Show structure as code: `class AIRail extends Inbox.Rail`, API signatures, never long bodies. Lists are flat and short; cut anything that is not a key point. Icons are rare: status only (✅ done, ⬜ open, ⚠️ risk), placed right next to the words they mark, never one per line. Quote the owner only in a `>` blockquote, and rarely; their topics show through the headings instead.

**Show it with the widget, then use words.** (the owner, 2026-09-25: "I don't want to read things. I want to see.") Files → `ext/files` (the tree, and highlighted source on click). An object → its live instances. A layout → a screenshot. A task → its checklist. Words come after the picture, and only as many as it takes.

**Clarity is familiar structure.** (the owner, 2026-09-29) Each heading names its topic and states its gist in one line, so a reader knows what it is before any detail. Items are as few as it takes, most important first; a familiar concept needs no explanation, only its name and a link to its own page. Detail is added only when it changes what the reader does. Pick names that can't be misread, and use the same name every time.

**A name is a name plus its scope** (the owner, 2026-10-03). Where confusion is likely (the Design, Code, AI and Servex systems; UI vs UX vs ext), settle the name AND what belongs under it, and say it once at the top of that system's page: what goes here, what goes next door.

**Route everything.** Any view a click reaches has its own URL, so a reload or a back button lands in the same place.

**Link every mention, and every page** (the owner, 2026-10-08): the owner browses the website, not the file system, so a file that is not linked will never be found. Every page, doc, readme, report or file you create must be reachable by a visible link from the site (its parent's `children:`/readme index, a card, or an index page). Whenever text names something that exists and has a URL (a page, class, module, session, task, card, model such as `/framework/ai/models`, a file), it is a link, on UI cards and content alike: use the mention system (`ext/Mention`, `#Page` `@agent` `/path`) instead of plain names. Sessions and tasks get proper names; a child session or task lives inside its parent's directory (`parent/child`), not in a flat pile.

## Readmes and docs

**Docs point, they don't explain.** Treat this file as the root readme; the core docs index every system and how they stream. This file and every `readme.md` bring a topic to your attention; the detail is in `doc/*.md` beside the module (its Docs tab, at `/<module>/doc/`). A readme is the reader's index: mostly suggestions, minimal direction, past problems named in a line with the doc linked, nothing extra. Every module: `readme.md`, `page.js` (show, don't tell), `doc/`. Nothing crawls — a page exists once its parent's `children:` names it.

**Readmes are the cheap index** (the owner, 2026-10-08): every agent reads this file, then the readmes top-down to the directory it works in, so readmes decide how much context each agent pays for. Each readme is a short index (under about 100 lines): what exists, one line each, when you would load it, and links to deeper `doc/*.md` or sibling readmes. Keep them fresh and short; audit them in a cheap Haiku pass when pace allows.

**The iceberg readme, and a readme as memory** (the owner, 2026-10-08): a parent readme is the tip of the iceberg: a solid index of what is inside (each subsystem, one line on what it is and when you would load it, a link). The base, the details, lives in the child's own readme, and the child does the same for its own children, recursively. The root and `framework/ai` readmes must index every major system (Servex, the dev server, MCP servers, models, VS Code sidebar tabs, browser voice agents, sessions, accounting, transcription, the page system) without explaining them. Each module's readme holds its essence and guiding principles, and an `architecture.md`-style doc beside it holds decisions, linking the original refined prompts; keep both fresh, so the owner's suggestions accumulate in the right place instead of dying with a session.

**Name things, and write `.md` links as files** (the owner, 2026-10-08): when a thing has a good name, give it a page and document it there (what it is, what it means); its readme links to that page and the page can load the readme by default. So always write the plain file path (`doc/flow.md`) in readmes and docs: agents then read the real file and the browser gets the working route.

- **The readme chain:** read the readmes root to leaf before working in a directory, and again when you move to another one, or start a fresh session there (`/framework/ai/readmes/`).
- **Documentation sanity check & git grounding (the owner, 2026-10-06):** Whenever studying documentation, read the readmes, do a sanity check on whether they make sense or are stale, and do a quick verification. If there's an obvious easy fix, make that fix. Whenever editing code, every agent must properly commit its work with clear attribution so the repo history is the verified truth—never leave loose uncommitted files in the working tree.

## Memory, history, safety

**Context must not die in sessions** (the owner, 2026-10-08): the useful decisions and insight from a session go to the page or module they concern, linked back to the source prompt, not left in chat. Before major surgery on a system, gather every past ask about it into one place, weed out the conflicts, decide, then build. Agents post an update or log line at least every ~5 minutes of work; a quiet agent is presumed stalled (Servex's `TaskLoop` chases it).

**Link, don't regenerate** (the owner, 2026-10-08): never spend tokens repeating what is already written. Reference the original prompt, session, task or doc by link (a text link first; embedded previews later, since they load a lot of data). The owner's suggestions are logged on the page they concern so later agents find them there, as a reference to the source prompt, not a retyped copy.

**Never destructive** (the owner, 2026-10-08): data integrity first. Do not delete logs, merge sessions or records, overwrite history, or eliminate anything; add, link and reference instead, and commit as often as you can so git is the undo. If something truly must go, move it aside (a `salvage/` branch, an archive path) and say so. The AI can find a non-destructive way.

**Moves and renames are scripted, never retyped** (the owner, 2026-10-08): to port, move or rename files (sessions, tasks, logs), write a node script that does it procedurally (`git mv`, a dry-run first, a manifest of every old to new path, reversible), preserving everything. An AI never copies data by reading and rewriting it. Also run a **visibility check** on anything we work on: link whatever exists in the repo but not on the site.

**Commit after every working step** (the owner, 2026-10-08): small, frequent commits are the versioned log; uncommitted progress is lost progress and invites regressions. Commit each step that works before starting the next (smoke-test first: never commit something broken; once it works, commit, since git can always roll it back), in a worktree, and merge after reviewing the diff. When a page is rendered by a template or layout, make it findable which one and where it lives.

**Stream, don't poll** (the owner, 2026-10-08): anything that happens in real time (a transcription, a session doing work, cost, logs) is architected as a stream (JSONL append + the `live()` tail) with updates in about 100 ms, never a timed refresh that shows stale data. When you find yourself writing `setInterval` + `fetch`, look for the stream first.

## Classes (detail: `public/framework/ai/doc/classes.md`)

**Classes are the structure** (the owner, 2026-10-08): the framework is object-oriented, so lean on classes and instances in code and in documentation. Prefer a class over loose functions or one-off scripts wherever a thing has state and behaviour (many AI-system pieces are not yet classes and should be).

**Write classes, not function bags** (the owner, 2026-10-08): one class per file, the file named for the class (`SessionsPage.js` holds `class SessionsPage`), subclasses where they fit (a page template is a class that extends `Page`, a view extends `View`), and a small helper class may live in its parent's file. Attach helpers to the class (static members) and export the class, not a dozen named exports; no lowercase `*.js` files that export piles of loose functions to be cobbled together. A `page.js` stays tiny: import the class and instantiate it. Keep comments to what is not obvious: one line, ideally a pointer to a doc, never a paragraph; history and lessons go in `doc/` (the owner, 2026-10-12; the `code` skill).

**Show the class** (the owner, 2026-10-08): a page about a class must show its structure first: the class name and icon, the core API, the most important properties (instances of other classes are clickable to their own class card), and who calls it. Where a class has a UI, the demo shows two things side by side: the rendered view the user sees, and a debug view of the live instance (a tree/card that renders every property by type), so you watch the data structure change as you use the demo. Do this for the classes you work on; not a mass operation.

**Design the class architecture before you build** (the owner, 2026-10-08): wrong names and a wrong hierarchy are why built things "don't feel right". Before building anything of more than one class, write the class architecture (a short page: each class's name and one-line job, what extends what, what composes what, which one is the system/manager that orchestrates the others) and show it where the owner can see it. Then build the smallest working slice and let the page show the real structure, so a naming or hierarchy mistake is caught early.

## Cost and roles

- **Usage pace (the owner, 2026-10-02):** every mastermind reads the usage snapshot when it starts and before each spawn (`ai/usage.json`; Servex injects it). Pace = the share of the week used ÷ the share of the week gone. Over pace: Sonnet by default, no Opus without a stated reason, fewer agents, no redundant checks, and review the work yourself when the files are already in your context instead of spawning a reviewer. Minions just do their task.
- **Audits go to Haiku, under 100k tokens** (the owner, 2026-10-08): task audits, readme audits, searches and fan-outs use Haiku in small inlined batches; Sonnet is for UI and object-oriented code. A request over 100,000 tokens costs about 5x per token, so every Haiku job stays well under it (aim for 30–60k; never drift over by accident); a node script chunks big inputs (a raw session file, a log) into pieces sized to fit with room for the reply. No Batch API / API key for now.
- **Mind the token burn** (the owner, 2026-10-08): every agent weighs the token cost of a task before starting it, and above all a mastermind. Every turn re-processes the whole context, even on a cache hit, so iterative, long-winded work that keeps going back to the model burns tokens. Rules: (1) **let a script read and calculate** (a node script that reads the data and prints a summary is cheap and good); the model reads only the summary. (2) **Batch tool calls**: request all the files you need in one turn, never one file per turn. (3) **No session replays or long audits unless asked.** (4) When a long iterative pass is truly needed, give it to Haiku, not Sonnet or Opus. (5) Keep sessions short and start fresh when the topic changes.
- **No hard fences between roles** (the owner, 2026-10-08): a minion that can do a mastermind's job should just do it. Do not add rules or tool fences that stop a capable agent; the mastermind is simply the one that decides and splits work.

## Ask before

- Breaking a constraint: no build step (`public/` runs as-is; imports are real `.js` URLs), no server at runtime (production is static), no new npm dependency (`npx` and global tools are fine).
- Major surgery: renaming a core API, moving a responsibility, anything with a dozen callers.

## Where to look

- **First, every new session:** `public/framework/ai/handover.md` (state of the world, what is open) and `git log --oneline -20` (what landed recently). Query the logs only when you need a detail; never read them whole. (the owner, 2026-10-09)
- `readme.md` (root) — setup, branches, deploy
- `public/framework/readme.md` — THE module index (every module, one line, one link). Every mastermind and voice agent reads CLAUDE.md and then this index before working; a minion with a narrow build task may skip the index.
- `public/framework/ai/` — the task log: open a task before the first edit (`new-task`), log as you go, land it (`finish-task`)
- `Server/` — dev server only
- `Servex/` — the agent system: roles, sessions, spawning, the quick-fix pool, the heartbeat, merge and review. Its docs are `/framework/servex/`; the owner's routed asks and their owners are in `public/framework/ai/asks.jsonl`
- Scratch — scripts, transcripts, intermediate JSON — goes in the session scratchpad, not the repo

## Pages, cards, review

- **Pages are live (the owner, 2026-10-02):** almost everything we build is a page that updates itself while you watch. An agent that creates or works on a page writes its `page.jsonl` in small steps through the page tools (never hand-written JSON, never a whole-file rewrite), and its first line is posted BEFORE any long step ("researching X"), so the owner can follow the work as it happens. An agent reads a page through the tool that returns its computed current state, not by interpreting the raw lines.
- **Cards:** every task reports on its card on the AI board. The card is what the owner reads; chat replies are not.
- **The page inbox:** a note left on a page reaches the agent that owns it. Use it for coordination, never for content.
- **The review gate and the four widths:** `merge.mjs` refuses a page change with no review report. Pages are checked at 400, 1200, 1920 and 3440 before they land.

## The site is live while you edit it (the owner, 2026-09-19)

The owner works on the running site while agents write to it. Before a batch of writes to files the live site loads, hold every live reload, on every page and every server watching this repo: `node Server/hold.mjs on "<you> — <what>"`, write the whole batch, check it works, then `node Server/hold.mjs off "<you>"` — one reload instead of one per file. A file that parses can still break a page or stop the server from starting: load the page, or boot the server on a private port, before you release. Detail: `Server/doc/watch.md`.

## Traps that never throw

- A class's folder, file and name match, capitalised: `ext/JSONL/JSONL.js` exports `class JSONL`. A lowercase file never holds a class someone will look for. `code/patterns` has the rule and a census script.
- No DOM after an `await`: capture the box synchronously, fill it in a callback.
- Every CSS rule inside a layer — `base theme site util`; the order lives once, in `framework.css`, which `app.js` loads first.
- Resolve URLs against `import.meta`, never the document.
- Only `p()`/`h1`–`h6` read backticks; one backtick inside `` css(`…`) `` kills every page.
- Imports flow down; a parent↔child import cycle breaks only on deep reload.

## Law: code streams, AI does not (owner, 2026-10-16)

Never rely on an agent to keep the UI current. The UI plugs into raw data (a JSONL file, a log) and code streams the change to the screen. A card an agent has to rewrite is not live. If a view needs an agent to refresh it, the view is wrong: give it a store.
