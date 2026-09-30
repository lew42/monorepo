# CLAUDE.md

Lew42 — a no-build, native-ESM web framework; the site is static, `Server/` is dev only.
This file rules; skills and readmes elaborate it. **Do not edit it without asking.**

## Laws

1. **Less is more — ASAP, As Simple As Possible.** Fastest working version first, then improve. Show, don't tell — a demo you can open beats a description. Question every word, line, section. Deep docs may breathe.
2. **Clear beats brief — by far.** Simple, but clear: explain it like I'm five. Start with the basics, in full, plain sentences, so the reader knows exactly what is being said before any detail arrives. Give me something I can chew quickly, without effort. Every page, demo and snippet makes its one takeaway obvious — a reader should be able to say what they are supposed to learn from it. Detail that can move somewhere better moves there and gets a link; don't restate every caveat everywhere. An extra sentence that clarifies a necessary point belongs. "Minimal speak" — clipped fragments, undefined words, jargon standing in for an explanation — is a failure, not economy. New coders are the audience. (the owner, 2026-09-04)
3. **Prioritize.** Time, quantity, quality, outcome: the most important things come first, for the most benefit to the user. Everything reads as a quick scan — a few short sections, then a link to the long form.
4. **Follow the owner's words.** Build what was asked, the way it was described, and lean into the owner's own names and preferences. Don't go in a different direction without a very good reason; if you do, say why. (the owner, 2026-09-30)

## Presentation — always the overwhelmed newcomer (the owner, 2026-09-05)

Level 1 is one page, mostly above the fold: what the thing is, **shown**; its major parts; the way in; room to breathe. Detail is never removed — it nests one click down, where it belongs, and never sits on the first page. Don't tell the reader what you are about to show them; show it. An index page is a wall of previews, kept small enough to digest. Demonstration and report pages are held to this harder than documentation. A report to the owner is one screen of plain sentences with links, never the nitty gritty — "getting reports with details I can't follow doesn't help me at all." A file or module named in a message is a clickable link to its page on the site (`/framework/ux/Dictate/`); the source file (`Dictate.js`) is only a second link. (the owner, 2026-09-24)

**Show it with the widget, then use words.** (the owner, 2026-09-25: "I don't want to read things. I want to see.") Files → `ext/files` (the tree, and highlighted source on click). An object → its live instances. A layout → a screenshot. A task → its checklist. Words come after the picture, and only as many as it takes.

**Route everything.** Any view a click reaches has its own URL, so a reload or a back button lands in the same place.

**Clarity is familiar structure.** (the owner, 2026-09-29) Build a hierarchy of understanding: each heading names its topic and states its gist in one line, so a reader knows what it is before any detail. Under it, only as many items as it takes, most important first. Each item sits beneath the right parent, with the right children. A familiar concept needs no explanation, only its name and a link to its own page. Detail is added only when it changes what the reader does. Pick names that can't be misread, and use the same name every time.

## Ask before

- Breaking a constraint: no build step (`public/` runs as-is; imports are real `.js` URLs), no server at runtime (production is static), no new npm dependency (`npx` and global tools are fine).
- Major surgery: renaming a core API, moving a responsibility, anything with a dozen callers.

## Docs point, they don't explain

This file and every `readme.md` bring a topic to your attention; the detail is in `doc/*.md` beside the module (its Docs tab, at `/<module>/doc/`). A readme is the reader's index: mostly suggestions, minimal direction, past problems named in a line with the doc linked, nothing extra. Every module: `readme.md`, `page.js` (show, don't tell), `doc/`. Nothing crawls — a page exists once its parent's `children:` names it.

## Where to look

- `readme.md` (root) — setup, branches, deploy
- `public/framework/readme.md` → `core/` `ext/` `styles/` `ui/` `web/` — each dir's readme is its entry
- `public/framework/ai/` — the task log: open a task before the first edit (`new-task`), log as you go, land it (`finish-task`)
- `Server/` — dev server only
- `Servex/` — the agent system: roles, sessions, spawning, the quick-fix pool, the heartbeat, merge and review. Its docs are `/framework/servex/`; the owner's routed asks and their owners are in `public/framework/ai/asks.jsonl`
- Scratch — scripts, transcripts, intermediate JSON — goes in the session scratchpad, not the repo

## The site is live while you edit it (the owner, 2026-09-19)

The owner works on the running site while agents write to it. Before a batch of writes to files the live site loads, hold every live reload, on every page and every server watching this repo: `node Server/hold.mjs on "<you> — <what>"`, write the whole batch, check it works, then `node Server/hold.mjs off "<you>"` — one reload instead of one per file. Streams (the chat log, the AI board) keep flowing during a hold; it expires by itself after five minutes. A file that parses can still break a page or stop the server from starting: load the page, or boot the server on a private port, before you release. Detail: `Server/doc/watch.md`.

## Traps that never throw

- No DOM after an `await`: capture the box synchronously, fill it in a callback.
- Every CSS rule inside a layer — `base theme site util`; the order lives once, in `framework.css`, which `app.js` loads first.
- Resolve URLs against `import.meta`, never the document.
- Only `p()`/`h1`–`h6` read backticks; one backtick inside `` css(`…`) `` kills every page.
- Imports flow down; a parent↔child import cycle breaks only on deep reload.
