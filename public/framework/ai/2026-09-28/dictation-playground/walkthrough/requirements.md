# Minion E — the playground walkthrough (Next / Next)

Load the `minion` skill first, then `page`, `new-page`, `code`. Parent task: `public/framework/ai/2026-09-28/dictation-playground/` (read `requirements.md`; owner's words at `public/framework/ai/2026/09/28/dictation-a-playground-and-a-better-proc/owner-words.md`).

The owner, 2026-09-25: "demos so simple and self-evident that I literally just click Next." One small screen per step: a real screenshot, one sentence, a link to open it live.

## Where you work

The playground is MERGED into the main tree's working copy: `C:/Code/lew42/monorepo`, live at `http://monorepo.localhost/`. Work there. The site is live while you edit: `node Server/hold.mjs on "minion-dictate-walkthrough — walkthrough" --paths "public/framework/ux/Dictate/playground/**"` before writing, `off` after you've loaded the page. Never commit, never `git stash` / `reset` / `checkout --`. Never restart a server.

## Fence

- NEW `public/framework/ux/Dictate/playground/walkthrough/` — `page.js`, `shots/*.png`.
- `public/framework/ux/Dictate/playground/page.js` — add `children: ["walkthrough"]` (or append to it) and one link to the walkthrough at the top of the playground's content.

## Build

Copy the shape of `public/framework/ai/2026-09-25/ai2-lead/page.js` exactly (the `Wizard` from `/framework/ux/Wizard/Wizard.js`, the step in the `#N` hash, big picture + one sentence + "Open it live →"). Title "Dictation playground, step by step". Steps, each a 1920×1080 headless shot of the real page:

1. **Where it is** — `/framework/ux/Dictate/` reached from the rail (click UX → Dictate), the playground at the top.
2. **Audio source** — the mic picker and the level meter. The meter must be MOVING in the shot: drive it via the playground instance (`globalThis.$dictate_pg`, its `meter()`/`on_meter` path) with a value like 0.6.
3. **Raw Whisper** — ▶ Sample mid-run: each chunk on its own line, the grey guess as the last line, a blank line before the new paragraph.
4. **Corrections** — the fast assistant's strike (red) / add (green) marks. This must be the REAL model: `/api/tidy` is not live on Servex until its restart, so in your Playwright script intercept `http://127.0.0.1:8090/api/tidy` with `page.route(...)` and fulfill it by calling `tidy()` imported from `C:/Code/lew42/monorepo/Servex/agents/tidy.js` in node (a real claude-sonnet-5 call, ~3 s each; add `access-control-allow-origin: *`). The status line must say "fast assistant", not "rules".
5. **Live** — two shots: the marks mid-fade (~2 s after a chunk) and the clean text after 6 s (`after:` field, like ai2-lead's last step).
6. **Later** — the structured final version (headings, sections) waits on card `2026/09/28/structured-content-icon-cards-outlines-b`; reuse shot 5's clean text and say so in one sentence.

Sentences: plain, one each, the owner's own names (playground, audio source, raw Whisper, corrections, live, fast assistant).

Every Playwright launch `headless: true`; scripts in the session scratchpad named `dp-e-*.mjs`; `windowsHide: true` on any spawn.

## Prove it

`node Server/smoke.mjs . /framework/ux/Dictate/playground/walkthrough/ /framework/ux/Dictate/playground/ --base http://monorepo.localhost` shows no FAIL. Open each shot and check it shows what its sentence says. Log to `public/framework/ai/2026-09-28/dictation-playground/walkthrough/task.jsonl` (`group: "dictate"`, `node .claude/hooks/append.mjs`). Reply in one short message: the url, and the fast assistant's actual outputs for the sample chunks.
