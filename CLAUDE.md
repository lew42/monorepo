# CLAUDE.md

Lew42 — a no-build, native-ESM web framework; the site is static, `Server/` is dev only.
This file rules; skills and readmes elaborate it. **Do not edit it without asking.**

## Laws

1. **Less is more — ASAP, As Simple As Possible.** Fastest working version first, then improve. Show, don't tell — a demo you can open beats a description. Question every word, line, section. Deep docs may breathe.
2. **Clear beats brief — by far.** Simple, but clear: explain it like I'm five. Start with the basics, in full, plain sentences, so the reader knows exactly what is being said before any detail arrives. Give me something I can chew quickly, without effort. Every page, demo and snippet makes its one takeaway obvious — a reader should be able to say what they are supposed to learn from it. Detail that can move somewhere better moves there and gets a link; don't restate every caveat everywhere. An extra sentence that clarifies a necessary point belongs. "Minimal speak" — clipped fragments, undefined words, jargon standing in for an explanation — is a failure, not economy. New coders are the audience. (the owner, 2026-09-04)
3. **Prioritize.** Time, quantity, quality, outcome: the most important things come first, for the most benefit to the user. Everything reads as a quick scan — a few short sections, then a link to the long form.

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
- Scratch — scripts, transcripts, intermediate JSON — goes in the session scratchpad, not the repo

## Traps that never throw

- No DOM after an `await`: capture the box synchronously, fill it in a callback.
- Every CSS rule inside a layer — `base theme site util`; the order lives once, in `framework.css`, which `app.js` loads first.
- Resolve URLs against `import.meta`, never the document.
- Only `p()`/`h1`–`h6` read backticks; one backtick inside `` css(`…`) `` kills every page.
- Imports flow down; a parent↔child import cycle breaks only on deep reload.
