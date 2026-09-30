# Minion brief: an object-oriented logger, rendered as nested cards

Load the `minion` skill and the `code` skill first. Parent: task-mastermind-cards-and-logs. Parent task dir: `public/framework/ai/2026-09-29/cards-and-logs/` (read `owner-words.md`, first section, in full).

## The owner's words
"it was actually an object-oriented logger. You could just say like this dot log ... I used the console dot log. I rendered my own logs ... It was essentially like a nested content widgets. Like you know, each log you could create log groups, and each method was a log group, and would kind of contain any logs within that method ... Potentially any object on any page could have its own log and render it ... they can't go too deep ... after the third level, you're kind of maxing out your padding space ... a H2 section, for example, doesn't really need an extra indentation for its content."

## Work in
The worktree `C:\Code\lew42\worktrees\cards-and-logs` (server http://localhost:52442/). Commit there, by exact path. Fence: `public/framework/core/Page/card/log/` only (new). Do not touch existing core/Page files; the parent wires the link.

## First
Look for the owner's past logger ideas and reuse them: grep the repo (`public/`, skip node_modules) for `class Logger`, `log_group`, `logGroup`, `console.group`, `.log(` methods on classes, and the git history (`git log --all -S "Logger" --oneline | head`). Note what you found in one line of your task log.

## Deliverables
1. `card/log/Logger.js` — plain ESM, house style (assign-based, every method a seam):
   - `Logger` class + a way to give ANY object `this.log(...)`: a mixin or `Logger.attach(obj, {name})`. `this.log(...args)` records an entry `{t, depth, args}`; `this.log.group(label, fn)` (or `group()`/`end()`) opens a nested group; an optional `Logger.wrap(obj, ["method"...])` makes each call of the named methods its own group, containing the logs made inside it (sync AND async).
   - Outputs, each opt-in, as small classes (`static Console`, `static Memory`, `static JSONL`): console (with `console.group`), in memory (an array of entries, default, capped), and JSONL lines (an `entries → lines` serializer, plus `Logger.from_jsonl(text)` to read a file back; writing to disk is a caller's job — say so in the doc).
2. `card/log/LogView.js` — renders entries as nested cards: level 1 and 2 are boxes (use the existing `.card` class and `--pad-card`, `--radius` tokens from framework.css; no new colors), level 3+ is hierarchy WITHOUT boxes (a heading and content at the same indentation). Groups collapse (a native `<details>` is fine). Updates live when new entries arrive. Use the View factories (`div`, `p`...) from `/framework/core/View/View.js`; no DOM after an await.
3. `card/log/page.js` — show, don't tell: a demo object (e.g. a tiny "Counter" with two methods, one async) whose calls produce a nested log, rendered live beside the code (`demo()` from ext/demo if it fits), plus a second demo reading a JSONL string back. Read the `new-page` skill for the page.js shape. Title "Log", icon, one-line description.
4. `card/log/readme.md` (index shape: what · Use · Watch out · More) and `card/log/doc/logger.md` (the API, one topic).
5. Load `http://localhost:52442/framework/core/Page/card/log/` headless (Playwright, windowsHide) with zero console errors; screenshot at 1920 and 400 into your task dir.

The page will be linked once the parent creates `core/Page/card/page.js`; until then open it by URL — if the router needs a declared child to load it, create `card/page.js` as a minimal stub with `children: { log: … }` following the new-page skill and say so in your log (the parent will replace the stub).
Budget ~$4; stop at it with what has landed. Log steps in your own task.jsonl.
