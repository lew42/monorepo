---
name: documentation
description: Run once a task's decisions are made and before finish-task — makes the touched module's docs current and conclusive: readme.md (the reader's index), page.js (show, don't tell), doc/*.md (the detail, one topic each). Also when asked to document, audit docs, write a readme, or add a doc page. Trigger skill: every task that touched a module under public/.
---

# Documentation — the final review

Read the directory's readme index first — it lists what exists — before working with anything in that directory.

How to write anything the owner reads (show the structure first, few words) is the `content`
skill. Load it first.

Decisions, caveats and measurements were already written while you worked (`decision` and `log` lines in `task.jsonl`; a `doc/<topic>.md` when a trap earned its own page). This pass **reviews that the touched module's docs are current — it adds nothing new.** Fix what is stale, delete what is wrong, move deliberation to `doc/decisions.md`, then run **`finish-task`**. The laws apply: less is more, clarity first, prioritize.

Everything here is writing files: no registration, no build. `./doc/` stands on its own; `ext/Doc` makes it browsable when the module has a `page.js`. **The README is the text version; the page is the navigational, structured version** (clickable modules), designed FROM the readme, not the reverse — short-term duplication between them is fine. Example: [`core/Page/make/readme-page/`](/framework/core/Page/make/readme-page/).

## 1. `readme.md` — the reader's index

The AI (and the owner) reads this first and must not have to open every doc to know it exists.

**A readme is the curated context (the owner, 2026-09-29).** It's the top 20% of the detail that serves 80% of the tasks in this module. Say exactly what is, now: not a rule set, not a vague tour. Leave out timestamps, decision history and anything the code already says plainly; that goes one click down, to `doc/decisions.md`. Test each line with one question: would the next agent building here do worse without it? If not, cut it. Every agent spawned for a directory gets this readme in its first prompt (`readme_chain`), so each extra line is paid for many times.
**Try to keep it as short and simple as possible (law #1).** Most land near 30 lines; if the
length is justified, it's fine. Shape:

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
next agent. Every important `doc/*.md` gets one summary line here, linked. Deliberation,
history and rejected alternatives move **verbatim** to `doc/decisions.md`; nothing is lost,
it is one click down.

## 2. `page.js` — show, don't tell

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

## Before finish-task

- Every `doc/*.md` named in the readme, every `notes:`/`files:` entry exists — both directions.
- The parent's `children:` names the page; nothing crawls.
- The page loads clean at 1600 (headless): no console errors, no `.md-error`.
- Say in your summary what you documented and what you deliberately left.

Improve this skill: append to [`improvements.md`](improvements.md).
