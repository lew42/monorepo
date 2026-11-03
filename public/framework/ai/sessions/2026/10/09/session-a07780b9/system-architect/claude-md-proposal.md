# CLAUDE.md

Lew42 — a no-build, native-ESM web framework; the site is static, `Server/` is dev only.
This file rules; skills and readmes elaborate it and never restate it. **Do not edit it without asking.**

## Laws

1. **Less is more — As Simple As Possible.** Fastest working version first, then improve. Show, don't tell: a demo you can open beats a description.
2. **Clear beats brief — by far.** Plain, full sentences a new coder can follow, basics first. Clipped fragments and undefined jargon are a failure, not economy. Every page, demo and snippet makes its one takeaway obvious.
3. **Prioritize.** The most important thing first; everything reads as a quick scan, then a link to the long form.
4. **Follow the owner's words.** Build what was asked, the way it was described, with the owner's names. If you go another way, say why.
5. **Keep working; never wait on the owner.** Decide, say what the alternative was, and keep going. The owner dictates while looking away and may never read your reply, so nothing may depend on an answer. Only something only the owner can give (a key, a login, money) goes on the board as a `Note:` card; everything else keeps moving. Don't do anything dangerous.
6. **One of everything.** Find what exists and extend it; never build a second version of a system. Every surface that shows the same thing uses the same component.
7. **Compute, don't recall.** Anything a computer can work out (state, counts, costs, records) is done by a script that reads the real state. AI handles judgment; record-keeping is code.

## The repo is the memory

- **Chat is ephemeral; files are not.** Anything worth keeping (a decision, an ask, an insight) goes in the module it concerns: a line in its `readme.md`, the detail in a `doc/*.md` beside it, linked back to the source prompt. Never retype what is already written; link it.
- **Commit after every working step**, your own files by exact path (`git commit -- <paths>`): the index is shared, and a bare `git commit` sweeps in other agents' staged files. Smoke-test first, never commit something broken. Work in a worktree and merge after reading the diff.
- **Never destructive.** Don't delete logs, merge records or rewrite history; add, link and archive instead (`git mv` to an archive path). Moves and renames are a node script with a dry run, never hand-copied.
- **Everything is linked.** A file the site does not link is never found. Every page, doc or report you create is reachable from its parent's `children:` or readme; every mention of a thing with a URL is a link (`#Page`, `@agent`, `/path` via `ext/Mention`).

## Writing for the owner — the overwhelmed newcomer

- **Chat is one or two sentences:** the most important first, a caveat only if it matters. The substance goes on the task's card on the AI board and in files.
- **Show, then tell.** Level 1 is one screen: the thing itself (a screenshot, the live object, a file tree, a checklist), its parts, the way in. Detail nests one click down and is never dumped on page one.
- **Familiar structure.** Each heading names its topic and states its gist; the same name every time; a module named in a message links to its page on the site.
- **Route everything.** Any view a click reaches has its own URL.

## Readmes and docs

Every agent reads this file, then the readmes from the root down to the directory it works in, so readmes decide what each agent pays for. A readme is a short index (under about 100 lines, the first 40 matter most): what exists, one line each, when you'd load it, a link. Detail lives in `doc/*.md` beside it. Write `.md` links as plain file paths (`doc/flow.md`); the site rewrites them to routes. Every module has `readme.md`, `page.js` (show, don't tell) and `doc/`. Nothing crawls: a page exists once its parent's `children:` names it.

## Code is classes

One class per file, the file named for the class; helpers are methods or statics; a page extends `Page`, a view extends `View`; `page.js` stays tiny. Before building more than one class, write the class architecture (names, what extends and composes what) where the owner can see it. A page about a class shows the class first: name, icon, core API, and a live instance beside its view. Detail: the `code` skill.

**Stream, don't poll.** Anything live (a transcription, an agent's work, cost, logs) is a JSONL append plus the `live()` tail, never `setInterval` + `fetch`. A page you build is written through the page tools in small steps (`page.jsonl`), its first line posted before any long step, and an agent posts a log line at least every ~5 minutes of work.

## Cost

Read `node Server/usage-now.mjs` before spawning; over pace, spawn nothing new and finish what is in flight. Haiku for scans, audits and fan-outs (keep each job well under 100k tokens; a script chunks big inputs), Sonnet for UI and object-oriented code, Opus only with a reason. Let a script read and count; batch tool calls in one turn; keep sessions short and on one subject.

## Ask before

- Breaking a constraint: no build step (`public/` runs as-is), no server at runtime (production is static), no new npm dependency (`npx` and global tools are fine).
- Major surgery: renaming a core API, moving a responsibility, anything with a dozen callers.

## Where to look

- **First:** `public/framework/ai/handover.md` (state of the world) and `git log --oneline -20`.
- `readme.md` (root): setup, branches, deploy · `public/framework/readme.md` → `core/ ext/ styles/ ui/ web/`
- `public/framework/ai/`: the task log. Open a task before the first edit (`new-task`), log as you go, land it (`finish-task`).
- `Servex/`: the agent system (roles, spawning, worktrees, merge and review); docs at `/framework/servex/`.
- `Server/`: dev server only. Scratch goes in the session scratchpad, not the repo.

## The site is live while you edit it

The owner uses the running site while agents write to it, so build in a worktree. In the main tree, hold reloads around a batch of writes: `node Server/hold.mjs on "<you> — <what>" --paths "<your files>"`, write, check the page loads, `off`. `merge.mjs` refuses a page change with no review report; pages are checked at 400, 1200, 1920 and 3440. Detail: `Server/doc/watch.md`.

## Traps that never throw

- A class's folder, file and name match, capitalised (`ext/JSONL/JSONL.js` exports `class JSONL`).
- No DOM after an `await`: capture the box synchronously, fill it in a callback.
- Every CSS rule sits in a layer (`base theme site util`, declared once in `framework.css`).
- Resolve URLs against `import.meta`, never the document.
- Only `p()`/`h1`–`h6` read backticks; one backtick inside `` css(`…`) `` kills every page.
- Imports flow down; a parent↔child import cycle breaks only on deep reload.


---
**Owner decision, 2026-10-09 17:10:** keep CLAUDE.md as it is; nothing here seemed wrong, but the current text stays. This file remains as a reference.
