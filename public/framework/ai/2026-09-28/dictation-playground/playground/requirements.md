# Minion B — the dictation playground

Load the `minion` skill first, then `code`, `page`, `new-page`, `css`, `new-css-class` as they apply. Parent task: `public/framework/ai/2026-09-28/dictation-playground/` (read its `requirements.md` — the numbered asks there are your acceptance test). **Read the owner's raw words in full:** `public/framework/ai/2026/09/28/dictation-a-playground-and-a-better-proc/owner-words.md`. Use the owner's own names: playground, audio source, raw Whisper, corrections, live, fast assistant, strike / add.

## Work in the worktree

`C:/Code/lew42/worktrees/qf-3` (branch `worktree/qf-3`); its dev server is `http://127.0.0.1:62967/`. Commit there. Never touch `C:/Code/lew42/monorepo` except your own `task.jsonl` log and your screenshots. Never restart any server. Another minion is adding `Servex/agents/tidy.js` in the same worktree — don't touch `Servex/`.

## Fence (you own only these)

- NEW `public/framework/ux/Dictate/playground/` — `page.js`, `Playground.js`, `Playground.css` (classes prefixed `ux-dictate-pg-`; check with `new-css-class`), `readme.md`, `doc/`.
- `public/framework/ux/Dictate/page.js` — add `"playground"` to `children:` and put the playground **at the top of the Dictate page's content** (the owner: "right at the default dictation page"), above the existing exhibit. Keep everything that is there.
- `public/framework/ux/Dictate/Dictate.js` — ONLY if a hook is missing: an optional callback (e.g. `on_guess(text)`, `on_segment(text, gap_ms)`) that does nothing when unset. No behaviour change for existing callers (`ext/Chat/Mic.js`, `ext/Ask/reply.js`). Prefer a subclass or the existing hooks (`on_text`, `draw_caption`, `commit`) if they suffice.

## What to build (the owner's asks)

1. **One click.** A 🎤 button: one press starts a NEW session and starts transcribing (clear the views, open the mic). Press again stops.
2. **Audio source panel.** Which microphone is selected (its label; a picker of `enumerateDevices()` audio inputs that uses `DEVICE_KEY` / `remember_device()` from Dictate.js) and the **live level meter** while listening — reuse the existing meter (`.ux-dictate-level`, `on_level`) rather than drawing a new one; it may be made larger.
3. **Raw Whisper view.** A code-font box built from divs + spans (NOT contenteditable, NOT a textarea): each Whisper chunk (settled segment) on its own line; a bigger break (a long pause / paragraph) is a blank line. The current guess shows as the last line, greyed, and is REPLACED in place each time Whisper revises it — the wrong version is not kept.
4. **Fast-assistant cleanup.** Each settled chunk goes to `POST http://127.0.0.1:8090/api/tidy` with `{text, before}` (`before` = the last ~300 chars of cleaned text) → `{ok, text, model, ms}` or `{ok:false, why}`. The page computes a **word-level diff** (LCS, a few dozen lines, no library) between the raw chunk and the cleaned chunk → deltas: strike (removed words) and add (inserted words). If `/api/tidy` fails or is absent (it will be until Servex restarts), fall back to a small local rule pass (fillers, doubled words, capital after a sentence end, capital first letter) and label the source visibly: "rules (no LLM)" vs "fast assistant (<model>, <ms> ms)". Chunks are cleaned in order.
5. **Corrections tab** — the diff: struck words red with strike-through, added words green, drawn inline over the text.
6. **Live tab** — the same, but each chunk's red/green marks fade out over ~5 seconds (CSS transition; the number in one constant), leaving the clean text.
7. **Tabs on the widget: Raw · Corrections · Live**, each routed (a reload or the back button lands on the same tab — look for the site's existing tabs helper/idiom first).
8. **▶ Sample button** — a scripted fake session (no mic, no Whisper) that feeds guesses word by word, then settles chunks, through the SAME pipeline, with fillers and a misplaced "?" in it (e.g. "so um i was thinking we should uh we should build the the playground", "what do you think? about the layout", a long pause, then a new paragraph). This is how you, I, and a headless test see it working without a microphone. Expose the playground instance on `globalThis.$dictate_pg` for tests.
9. A `readme.md` (index shape: what · Use · Watch out · More) and `doc/` for the playground. The structured final version is "later": one line naming card `2026/09/28/structured-content-icon-cards-outlines-b`.

Show, don't tell: the page is the widget, with at most one sentence above it.

## Prove it

Headless Playwright only (`headless: true`, never a visible window, never the owner's tabs; scripts in the session scratchpad named `dp-*.mjs`). Load `http://127.0.0.1:62967/framework/ux/Dictate/` and `/framework/ux/Dictate/playground/` at 1920×1080, press ▶ Sample, and screenshot each of the three tabs mid-run and after the live fade (5 s+). Zero console errors and zero failed requests on both pages and on `/framework/ux/Dictate/demo/` (a failed request to `127.0.0.1:8090/api/tidy` is expected until Servex restarts — the fallback must handle it without a console error). Save the shots as png into `public/framework/ai/2026-09-28/dictation-playground/playground/` in the MAIN tree.

## Log

`public/framework/ai/2026-09-28/dictation-playground/playground/task.jsonl` in the MAIN tree (new-task shape, `group: "dictate"`, append with `node .claude/hooks/append.mjs`), steps up front, decisions as they happen. Commit in the worktree. Report back in one short message: commit hash, shot paths, anything unticked.
