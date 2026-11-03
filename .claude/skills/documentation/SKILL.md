---
name: documentation
description: Run once a task's decisions are made and before finish-task — makes the touched module's docs current and conclusive: readme.md (the reader's index), page.js (show, don't tell), doc/*.md (the detail, one topic each). Also when asked to document, audit docs, write a readme, or add a doc page. Trigger skill: every task that touched a module under public/.
---

# Documentation — the final review

**This pass is step (2) of the build order** (in `sub-mastermind`): a fresh agent then reads only these docs, so they must stand alone. **The mastermind of the area runs it** (§4), from what its builders report changed; a builder that built a whole system runs it for that system. The quick look a mastermind gives every readme it reads is in `sub-mastermind` ("Readme upkeep is yours").

How the chain reaches agents, and its cap, is explained in [`Servex/doc/readme-chain.md`](/Servex/doc/readme-chain.md) and [`ai/doc/readmes.md`](/framework/ai/doc/readmes.md); this skill is how to write them. Size: a readme is a short index (CLAUDE.md: under about 100 lines; count words, about 800 at most, since a paragraph is one line), and the chain gives agents the whole readme, so every word costs every agent that works below it.

**Readmes stay current every turn, not only at the end** (the owner, 2026-10-22): start by reading the directory's readme whole, so it is in context once. Whenever a change alters what a readme says (a move, a rename, a new or removed part, a changed decision), update that readme in the same step and search for old references to the moved or renamed thing (`grep` the old name and path) and fix them. This final pass then only checks.

Read the directory's readme index first — it lists what exists — before working with anything in that directory.

How to write anything the owner reads (show the structure first, few words) is the `content`
skill. Load it first.

Decisions, caveats and measurements were already written while you worked (`decision` and `log` lines in `task.jsonl`; a `doc/<topic>.md` when a trap earned its own page). This pass **reviews that the touched module's docs are current — it adds nothing new.** Fix what is stale, delete what is wrong, move deliberation to `doc/decisions.md`, then run **`finish-task`**. The laws apply: less is more, clarity first, prioritize.

Everything here is writing files: no registration, no build. `./doc/` stands on its own; `ext/Doc` makes it browsable when the module has a `page.js`. **The README is the text version; the page is the navigational, structured version** (clickable modules), designed FROM the readme, not the reverse — short-term duplication between them is fine. Example: [`core/Page/make/readme-page/`](/framework/core/Page/make/readme-page/).

## 1. `readme.md` — the reader's index

The AI (and the owner) reads this first and must not have to open every doc to know it exists.

**A readme is the curated context (the owner, 2026-09-29).** It's the top 20% of the detail that serves 80% of the tasks in this module. Say exactly what is, now: not a rule set, not a vague tour. Leave out timestamps, decision history and anything the code already says plainly; that goes one click down, to `doc/decisions.md`. Test each line with one question: would the next agent building here do worse without it? If not, cut it. Every agent spawned for a directory gets this readme in its first prompt (`readme_chain`), so each extra line is paid for many times.
**Keep it short (law #1).** Most readmes land near 20–30 lines. A module readme covers four things and nothing else:
1. *What the module is* (and for whom)
2. *Its core ideas / concepts* (how it works)
3. *The files to read* (entry points)
4. *The `doc/` topics* (linked for deep dive)

Extra detail, history and examples go in `doc/<topic>.md`. Shape:

```md
# Panel — one line: what it is, for whom

## Index
[`child`](./child/) — what it is and what you'd use it for   (one line per child module)

## Use
one snippet, the common case

## Watch out
- one line per past problem, with the doc that has the detail: [`doc/focus.md`](./doc/focus.md)

## More
- [Overview](/framework/ext/Panel/) · [`doc/decisions.md`](./doc/decisions.md) · [`doc/generator.md`](./doc/generator.md)
- Files that matter: `Panel.js` (the class), `templates.css` (what a template looks like)
```

The first section of a directory readme with child modules is `## Index`, one line per child: `[name](./name/) — what it is and what you'd use it for`.

Mostly suggestions, minimal direction. No rules that might need breaking — they mislead the
next agent. **Word a judgment call as a judgment call** (the owner, 2026-10-14): a dynamic
situation written as a hard "must" fails at the edge cases, and the owner is "often going to be wrong"; write *should* or *could*,
name the factors and the clearly good or bad sides, and leave the call to the agent reading it. Don't load every caveat everywhere. Every important `doc/*.md` gets one summary line here, linked. Deliberation,
history and rejected alternatives move **verbatim** to `doc/decisions.md`; nothing is lost,
it is one click down.

**Name a file with a link, not a bare path:** on a page, `file_link(path, line?)` (exported from `/app.js`); in markdown, a link to its page. Name a method with its class-doc member page (`/framework/<module>/api/<method>/`) when one exists, rather than a line number. Either is one click to the real thing (the owner, 2026-09-29).

## 2. `page.js` — show, don't tell

**A system's top page leads with its class architecture** (the owner, 2026-10-04: "these class architectures I'm asking you for, I shouldn't have to. It should be a very familiar place in the documentation"). The parent class of a system (Page, Dictate, Item…) opens its Overview with the hierarchy in short pseudocode: base classes first, `Name extends Base { main properties }`, who makes each instance, how many, and where its data is stored. The demo comes after it, or one tab down.

Code or a `demo()` first, never a paragraph. Prose is a caption. Variants of one thing go in
the rail (`overview:`); a guided tour is a sequence. Label pasteable snippets with their file
(`code.js(src, "/app.js")`; in markdown, <code>```js /app.js</code>). End by naming the next
page. A module index is a `Doc` (`import { Doc } from "/app.js"`; `notes:` = `doc/<name>.md`,
`methods:`/`properties:` = `doc/method|property/<name>.md`, `files:` = `doc/file/<path>.md`);
a leaf demo page stays a plain `Page`. Pass the class, never an instance.

## 3. `doc/*.md` — one topic each

A new `doc/<name>.md` is in the Docs rail only once `page.js` names it (`notes:`; a new file goes in
`files:`) — `ext/Doc` declares, it does not crawl.
⚠ An unregistered `doc/<name>.md` still resolves at `/module/doc/<name>/` but logs one `404 …/page.js` in the console — add its name to `notes:`.
Every `.md` link opens rendered at `/<module>/md/doc/<name>/` ([`core/Page/doc/markdown.md`](/framework/core/Page/doc/markdown.md)); link with an absolute path, and cite a method or selector, never a line number. `doc/decisions.md` holds the record; `doc/<topic>.md` holds a trap or design worth its own url.

A Doc's `notes:` land at `/module/doc/<name>/`, `methods:`/`properties:` at `/module/api/<name>/`; `files:` have **no per-name route** (they render in the shared `/module/files/` browser). For a `note()`-shaped page the URL slugifies from the **title**, not the file name.

## 4. The documentation rule: where docs go, what goes in them, who writes them

Every mastermind follows this, in any folder. The owner's words: session-e00f55c9 `prompts.jsonl`, 2026-10-24T00:00:40Z.

**Three places, one job each:**
- **`readme.md`** is the folder's index, read whole by every agent working below it: what the folder is, one line and a link per part, and the current decisions in a line each. It says what is true now.
- **`<topic>.md` beside the readme** is for the few topics a reader of this folder needs often (for example `ai/priority.md`, `ai/handover.md`). The readme links each one.
- **`doc/`** is a namespace for everything else: one topic per file, subfolders per topic, `architecture.md` (the current decisions and why), `decisions.md` (how they moved), and dated notes when a date matters (`doc/2026-10-23-<topic>.md`). The readme links each important one in a line; a big `doc/` gets its own `doc/readme.md` index. Always `doc/`, never `docs/`.

When a folder passes about 10–15 files, group them into subfolders, each with its own small readme, so the parent stays an index.

**No dated logs in readmes.** The record of how something was decided lives in the session's or task's JSONL and in git; the readme states the outcome once. One exception: a rule that keeps being broken even though it is written down may be marked at the top of the readme as extra important, with its date and how often it was broken, until it stops being broken.

**Don't transcribe; edit.** When the owner says something about a module, don't append their sentence because they said it. Read what the readme and its docs already say, then write the clearest message for the next agent: the intent, in the fewest words, without over-specifying (a judgment call stays a judgment call). If the doc already says it, leave it or sharpen it. Link the prompt for the raw words.

**Context everywhere** (the owner, 2026-10-24: "if tasks are taken out of context, I have no idea what they are"). A name shown away from its home says what it belongs to: its parent (session, project, module) and its purpose, in a few words or a breadcrumb, on cards, rows, readmes and replies alike. Skip it only for a name the reader has plainly met many times. Hierarchies can be deep (a mastermind spawns a builder, which makes tasks), so show the chain up to something the reader knows.

**Readmes are the conclusive index, and the site is the human one.** If a readme doesn't name a thing, agents forget it exists; if no page links it, the owner never finds it. Whatever you build gets both in the same change: a line in the readme of every folder it touches, and a link from its parent's navigation (`children:` or the parent page). The `build` and `design` processes run this as their `index` step, so it does not rest on memory.

**Who:** the mastermind owns the docs of the area it works in, because it has the overview. It reads its area's readmes when it starts, fixes what is plainly wrong, and brings them current when the work lands. A builder that builds a whole system documents that system as part of building it; a builder of one part tells its mastermind what changed.

**Where a new file goes** (the owner, 2026-10-13: "creating a new file, what its name is and what goes in it" are the most important questions): a file about a module lives in that module's folder; a record lives in the store at its date path (`ai/sessions/YYYY/MM/DD/…`, made by `TaskDirs`); nothing else is created under `ai/`. A path the old way (`ai/<YYYY-MM-DD>/`) is refused by `append.mjs`.

**Promotion:** an ask the owner made in three or more sessions is a directive: write it into the module's `doc/architecture.md`, or, if it is site-wide, propose it for the root readme as a decision line (`node Server/RefineQueue.mjs --repeats` lists today's candidates; `ext/Refine/doc/refine-queue.md`).

**Cleanup:** a mastermind spawns one Haiku per `doc/*.md`, given that file and the files it describes, asking "still true? duplicated elsewhere? superseded?". The mastermind reads the answers and decides. A superseded doc moves to an `archive/` folder beside it (`git mv`, one line in the readme saying why), never deleted.

## Verifying a readme: one claim at a time (the owner, 2026-10-15)

The mastermind does not read the code. A Sonnet minion reads the code and is asked ONE readme claim at a time: "is this statement correct?" Flag every stale claim and fix or list it. One specific question per step works better than a whole-readme review. Source: [ask-8f9c9d80](/public/framework/ai/sessions/2026/10/15/voice-20261015/ask-8f9c9d80.md).

## Before finish-task

- Every `doc/*.md` named in the readme, every `notes:`/`files:` entry exists — both directions.
- The parent's `children:` names the page; nothing crawls.
- The page loads clean at 1600 (headless): no console errors, no `.md-error`.
- Say in your summary what you documented and what you deliberately left.

Improve this skill: append to [`improvements.md`](improvements.md).

## 5. `doc/architecture.md` — the conclusive decisions (the owner, 2026-10-13)

**A module's readme gives the one-line overview and links `doc/architecture.md` for decisions; `doc/decisions.md` (the log) is history, read only when you need to know how a decision moved.** A new agent reads `architecture.md` and nothing else about "why is it like this". Shape, rules and a filled example: [`architecture-template.md`](architecture-template.md). Short: a title, one paragraph of what the module is and the pattern it uses, then one entry per *current* decision (decision, why, alternative and trade-off, one link to the log entry). No dates, no "the owner said", no reversal history; most stay under 80 lines. Candidates are ranked by `node Server/ArchitectureCensus.mjs`; `--decisions <module>` prints the task-log decision lines to write from. Link it from the readme's `## More` line.

**Markdown holds conclusions, not logs** (the owner, 2026-10-22): a readme or doc states the decision, the outcome and what is useful later, once. The dated record of how it was reached (small decisions, attempts, timestamps) stays in the task's or session's JSONL, and the doc links to it. Never copy log data into markdown. Log lines follow the same rule (the owner, 2026-10-24): write one only when the state changes (a task added, started, waiting, complete) or when a file the owner should know about was written (a pointer line: its path and a one-line synopsis), not one per step, because the raw session transcript already records every step. A finished piece of work is the task's `complete` with its `outcome` and `links`, never a `show:` line; decisions and design go in the module's own docs, and the log only points to them ([task-buckets.md](/framework/ai/doc/task-buckets.md)). The docs, though, are current after every change, never stale. (`ai/log.jsonl` in a folder, written by the `dir_log` tool, is the per-folder log.)
