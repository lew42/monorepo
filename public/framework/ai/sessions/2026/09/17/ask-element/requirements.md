# ask-element — select any element on a page and ask about it; the answer knows its readme and decisions

**Three laws.** Less is more (ASAP: fastest working version, then improve; show, don't tell). Clear beats brief by far (full plain sentences, basics first). Prioritize.
**Length budget:** the affordance is one small control; the picker is one gesture; the demo page shows it in one screen. Your landing report is one screen of plain sentences with links.
**The reader is the overwhelmed newcomer.** Shown, not told. Detail nests one click down.

## The owner's words (2026-09-17)

> I believe there's this ask widget, like ext/ask that is an AI powered chat system and it hasn't been used a ton, it was put into the dev bar, maybe it needs to be put, or at least usable, right into a main web page. But I guess the idea is that I sort of want to be able to select any element on the page and ask something about it and have a session that, frankly, the session that created that thing. I suppose it can just read the readme if that path has a readme that the AI can load up and read what this thing is and what this element is and the design decisions that were made behind it.

The full prompt: `../mastermind-layout-browser/requirements.md`.

## Deliverables (each ticked against the sentence above at harvest)

1. **`pick()`** exported from `public/framework/ext/Ask/Ask.js` (or a sibling `pick.js` it re-exports): a crosshair mode — the cursor changes, the hovered element outlines, a click picks it, Escape cancels. It resolves to the element's **context**: the nearest `.page` ancestor's url (core sets it; read how `Page` stamps its element), the element's tag, classes and a trimmed `outerHTML` (first ~600 chars), and the text of that page path's `readme.md` and `doc/decisions.md` when they exist (fetch relative to the page url; 404 = omit; also try the framework module that owns the element's first class prefix via `framework/styles/css-scopes.txt` — say in your log whether that lookup earns its lines).
2. **Ask about it.** `chat({ task })` / `ask()` accept that context, and the turn's prompt opens with a plain sentence: what the element is, which page it is on, and where the readme says its decisions are — so the answer can cite them. The chat panel shows a one-line chip naming the picked element above the input.
3. **Usable in a main web page.** A tiny floating **?** control (`mount()` from Ask) that any page can call in `content()`: it shows only when `available()` (localhost, the server answering), opens the chat panel, and its first button is "pick an element". Mount it on `/framework/ext/Ask/` (the module's own page, as the demo: pick the demo's own card and see the context it gathered, printed, before any turn is spent) and in the dev bar's Ask tab as a button. Do not mount it site-wide; other pages opt in with one call.
4. **Docs:** `readme.md` Use gets the two lines (`pick()`, `mount()`); `doc/decisions.md` gets the record (what context is sent, the cost note, what was left).

## Where things are

- `public/framework/ext/Ask/` — `Ask.js` (the RPCs), `chat.js` (the panel), `ask.css`, `page.js`, `readme.md`, `doc/` (read `decisions.md`, `task.md`, `process.md` first). `Server/plugins/Ask.js` runs the turn (a fresh `claude -p --resume`; `context` is already a field — see how it travels before adding anything server-side).
- The dev bar: find the Ask tab with `rg -l "Ask" public/framework/dev` and name the file in your log.
- Every turn is bound to the tab that asked and costs money (~$0.02 haiku); spend at most two real turns testing, with `model: "haiku"`.

## Rules

- Load `code`, `css`, `layout`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/ask-element/`; write its `task.jsonl` launch line); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/framework/ext/Ask/**`, `Server/plugins/Ask.js` (only if the context must be handled server-side — say so), the dev bar's Ask tab file, your task dir. Nothing else.
- **Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`.** The owner's server (port 80) is NOT running; start your own: `PORT=8094 node server.js` from the repo root, in the background; kill it when you land. A Server/ change is live only on YOUR private server until the owner restarts theirs — say that in your landing. `ui-test` has the headless recipe; one screenshot of the picker mid-hover and one of the chat with the chip, into your task dir as jpeg.
- A turn drives one tab; a headless Playwright page is a tab — claim nothing the owner has open.
- Every CSS rule inside a layer; the Ask module's prefix is what `css-scopes.txt` says (run `new-css-class` for any new class).
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = a headline, links (the module page with the demo, the decisions doc), the two shots, the exact context one pick gathered (as a short code block), what was left and why. One screen.
