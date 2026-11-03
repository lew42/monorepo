# Minion brief: core/Page/ext — page extensions, Inbox first

Load the `minion` skill first, then `code`. Parent: task-mastermind-inbox-ext. Task dir: `public/framework/ai/sessions/2026/09/30/inbox-ext/` — the owner's words are in its `owner-words.md` (read the first section) and `requirements.md` (asks 1 and 2 are yours). The plan with its picture: `plan.md` there.

## The owner's words (verbatim, the part that is yours)

> let's create an extension directory ext inside of the core page directory and uh, create an inbox uh, class that's an extension that the page can use and uh, you know the page should we might have to use an extension system you can look at the server's plugin system because that's a pretty simple way to just have like it's a i think event driven you know hooks to to add uh plugins essentially that can do whatever they want um i think that's a good kind of decoupled way to to have extensions because then you can configure them via the browser using data rather than uh like hard code everything.

> the AI system should be able to message any page, any directory essentially by just adding, appending a message of some kind. In most cases, probably just like a chat message ... it could be type message ... if it's a question, it could be type of question or whatever, but the author should be the agent who sent it.

## Where you work

Worktree `C:\Code\lew42\worktrees\inbox-ext` (branch `worktree/inbox-ext`, its own server at http://localhost:51490/). Every edit goes there, never in the main tree. Commit after each finished piece. Do not merge; I (the mastermind) merge.

## Deliverables

1. **The extension system, minimal.** Model: `Server/Events.js` `static use(plugin)` + `setup(instance)`, and how `Server/run.js` wires plugins. In `core/Page/`:
   - `Page.use(Ext)` registers an extension for every page (code); a page.jsonl line `{"ext": "Inbox"}` (data) turns one on for one page: `PageLog.set()` already calls a method named by a line's key, so add an `ext(name)` method that imports `core/Page/ext/<Name>/<Name>.js` (resolved against `import.meta`) and calls its `setup(page)`.
   - Event hooks on the page: `on(event, fn)` / `emit(event, …)`; emit at least `line` (each page.jsonl line after line 1) and `render` (after the page's content is drawn). Keep it tiny; read `core/Page/Log.js` and `Page.class.js` before touching them, and add the fewest lines.
   - ⚠ core never statically imports ext code (see Log.js `open()`), and nothing here may slow a page with no extensions.
2. **`core/Page/ext/Inbox/`: the first extension.** Move, don't rebuild: `ext/drawer/inbox.js` (the page inbox that landed in task `ai/sessions/2026/09/30/page-inbox/page-inbox/`) moves here as `Inbox.js`; `ext/drawer/inbox.js` becomes a one-line re-export so the drawer keeps working unchanged. Add a static `setup(page)` that collects the page's `inbox` lines (`{"inbox": {type: "message"|"question", author, text, at}}`; an older `from` reads as `author`, a missing `type` as `message`) into `page.inbox`. The drawer's reads through Servex stay as they are.
3. **Docs:** `core/Page/ext/readme.md` (what an extension is, how to turn one on, the hooks — a few lines) and `core/Page/ext/Inbox/readme.md`; one line in `core/Page/readme.md` pointing at ext/. A tiny demo: `core/Page/ext/page.js` or a page.jsonl that turns Inbox on and shows its messages (add `ext` to core/Page's `children`). Use `create_page` / the `new-page` skill.
4. **Proof:** headless (Playwright, `windowsHide: true`), on the worktree server: the drawer's AI tab still shows its inbox on one page (screenshot before and after your change, 1920 and 400); the demo page shows two messages from a `{"ext":"Inbox"}` page.jsonl; zero console errors on `/framework/core/Page/`, `/framework/ai2/`, `/framework/`. Shots in `public/framework/ai/sessions/2026/09/30/inbox-ext/page-ext/shots/`.

## Fence

`core/Page/Page.class.js`, `core/Page/Log.js` (smallest edits), `core/Page/ext/**` (new), `core/Page/readme.md`, `core/Page/page.js` (the children line only), `ext/drawer/inbox.js`. Nothing else. Never touch `ai2/`, `ai/page.js`, Servex.

## Rules

Every process you start: `windowsHide: true`; stop any server you start. Log steps and decisions in your task.jsonl. End with one message to your parent: the commit ids, the shots, anything left. Budget about $5.

