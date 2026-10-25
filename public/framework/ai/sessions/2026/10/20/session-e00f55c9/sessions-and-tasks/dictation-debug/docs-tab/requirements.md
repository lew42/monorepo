# Dictate: a Docs tab on the dictation sheet (Part 7.7)

Budget: $4. Load the `minion` skill first. Model: Sonnet. Worktree: `node Server/worktree-up.mjs dictation-docs` (use the path it prints; it may name a different branch).
The owner's words: [../requirements.md](../requirements.md) Part 7 item 7 and Part 8 last-but-one bullet. Card: `2026/10/25/dictation-that-never-fails-in-the-browse`.

## What to build

1. **A third tab, "Docs", on the dictation sheet**, beside AI and Debug (the existing tabs: see `ux/Dictate/doc/debug-tab.md` and `Widget.js` / `DictationBar.js`; find where AI · Debug are made and add Docs there, same component, no second tab system).
2. **The tab shows the `ux/Dictate` readme**, rendered the way the site renders a readme (find the existing markdown/readme renderer with past-work; reuse it, never write a new one). Under it, links to the module's `doc/*.md` pages that a reader would want (start with `settings.md`, `architecture.md`, `whisper.md`, `debug-tab.md`, `voice-architecture.md`); one click opens one, rendered in the tab, with a back link.
3. **"How messages travel": one plain paragraph, at the top of the readme** (new short section, linked from the tab's top). Answer, verified against the code, each claim with a file:line in a footnote list below the paragraph: how the browser's dictated text reaches Servex today (WebSocket or HTTP, which route), who creates the voice session, how the fast assistant is fed (per sentence?) and how the smart assistant is fed (batches; `Servex/agents/WakePolicy.js`, default 12 s gap or 6 sentences, set in the settings panel). Plain sentences for a new coder (CLAUDE.md law 2). Prove it's true before you write it: grep the code, don't guess.
4. **Live demos are optional, last.** If time is left, one small live demo of one stage beside its doc (Whisper or placement), reusing what `ux/Dictate/demo/` or `playground/` already has. Skip it rather than go over budget; say so.

## Proof

- A headless test `ux/Dictate/test/docs-tab.mjs`: opens the sheet, clicks Docs, sees the readme's heading, clicks one doc link, sees its heading, clicks back. 0 FAIL.
- Rerun `test/settings.mjs`, `order.mjs`, `flicker.mjs`, `repeat.mjs`: 0 FAIL.
- Shots at 400 and 1920 of the Docs tab in `docs-tab/shots/` (force-add; `shots/` is gitignored). Read the 400 one yourself.
- `node --check` every JS file you touch.

## Fence

`public/framework/ux/Dictate/**` only (readme, doc, Widget/DictationBar and their CSS, test), plus this task folder. If the readme renderer needs a change outside the fence, don't make it: log it in this task's `session.jsonl` and work around it.

## Never

Never kill or restart the dev server, never drive the owner's tabs (headless only), never stash (diff instead), never push, commit by exact path. Don't write the owner's name anywhere. Log findings as `log` lines in this folder's `session.jsonl`, not a findings file.

## Done

Commit in the worktree, then message `mastermind-dictation-2` with: branch, commit, test results, the paragraph's text, and what you skipped. Don't merge.
