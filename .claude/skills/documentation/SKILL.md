---
name: documentation
description: Run once a task's decisions are made and before finish-task — makes the touched module's docs current and conclusive: readme.md (the reader's index), page.js (show, don't tell), doc/*.md (the detail, one topic each). Also when asked to document, audit docs, write a readme, or add a doc page. Trigger skill: every task that touched a module under public/.
---

# Documentation

**Post-task, conclusive, minimal.** Document once the decisions are made — authoritative,
simple, clear, for posterity. No deliberation or back-and-forth in a readme; it names what
*is*, in summary, and links a doc only when the detail is genuinely needed. Three laws apply:
less is more, clarity is the exception, prioritize. Then run **`finish-task`**.

Everything here is writing files: no registration, no build. `./doc/` is a convention that
stands on its own; `ext/Doc` is how it becomes browsable when the module has a `page.js`.

## 1. `readme.md` — the reader's index

The AI (and the owner) reads this first and must not have to open every doc to know it exists.
**Try to keep it as short and simple as possible (law #1).** Most land near 30 lines; if the
length is justified, it's fine. Shape:

```md
# Panel — one line: what it is, for whom

## Use
one snippet, the common case

## Watch out
- one line per past problem, with the doc that has the detail: [`doc/focus.md`](./doc/focus.md)

## More
- [Overview](/framework/ext/Panel/) · [`doc/decisions.md`](./doc/decisions.md) · [`doc/generator.md`](./doc/generator.md)
- Files that matter: `Panel.js` (the class), `templates.css` (what a template looks like)
```

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
⚠ Only a **Doc**-based module registers the pretty `/module/doc/<name>/` route. Beside a plain
**Page**-based module, link the literal file path — `./doc/decisions.md` from inside the module,
absolute **with `.md`** from outside; the pretty form 404s in console while a static server's SPA
fallback masks it with a 200 (bit ext/Panel 2026-08-19 and ux-graduations 2026-08-21 — twice).
Written along the way when a caveat surfaces, or at the end. Absolute links only
(`/framework/core/View/api/capture/`) — a fetched file's relative links resolve against
`doc/`. Never cite a line number; cite the method or selector. `doc/decisions.md` holds
the record; `doc/<topic>.md` holds a trap or a design worth its own url.

## Before finish-task

- Every `doc/*.md` named in the readme, every `notes:`/`files:` entry exists — both directions.
- The parent's `children:` names the page; nothing crawls.
- The page loads clean at 1600 (headless): no console errors, no `.md-error`.
- Say in your summary what you documented and what you deliberately left.

Improve this skill: append to [`improvements.md`](improvements.md).
