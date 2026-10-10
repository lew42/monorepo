# Minion C — review fixes for the dictation playground

Load the `minion` skill first, then `code` and `css`. Parent task: `public/framework/ai/2026-09-28/dictation-playground/` — read its `requirements.md` and the owner's raw words at `public/framework/ai/2026/09/28/dictation-a-playground-and-a-better-proc/owner-words.md`. A fresh reviewer found the findings below: `public/framework/ai/2026-09-28/dictation-playground/review.md`. Read it; its line numbers point into the code.

## Work in the worktree

`C:/Code/lew42/worktrees/qf-3` (branch `worktree/qf-3`, dev server `http://127.0.0.1:62967/`). Commit there. In the MAIN tree (`C:/Code/lew42/monorepo`) touch only your log and screenshots. Never `git stash` / `checkout --` / `reset` — to see a committed version use `git show HEAD:<path>`. Never restart a server.

## Fence

`public/framework/ux/Dictate/playground/**` and `public/framework/ux/Dictate/page.js`. Nothing else.

## Fix (review.md numbering)

1. Rule pass: drop "like" and "i mean" from `FILLERS` (the model handles them). Keep um/uh/ah/er/erm/hmm.
2. Stale cleanup: stamp each queued chunk with a session number; skip drawing when it is not the current session.
3. The level meter must read as a meter at idle: a visible track (contrast against the page, e.g. `--line`-strong border or a darker track) with a small "level" label, bouncing fill while listening.
4. Empty Raw / Corrections / Live panels show one muted line: "press 🎤 or ▶ Sample — Whisper's words appear here" until the first chunk.
5. One control for the mic: drop the "mic: default" label; the picker itself names the selected mic (label it "Audio source").
6. Dictate page intro: say "three tabs", not "side by side".
7. `/api/tidy` timeout 4 s → 20 s (the Agent SDK starts a process per call; measured 2.4–3 s warm, cold can be longer). While a chunk is being cleaned, the status line says "cleaning…"; the fallback to rules happens only on a real failure or the timeout.
8. One line in `doc/decisions.md` on the rule pass's limits (merges "had had", no lone "i").
9. `views`: drop a widget from the set once its element is no longer connected (`isConnected`), on the next update.
10. Check the site router ignores the `#raw` hash (reload + back button land on the same tab, and no console error). Report what you found; change nothing outside the fence.
11. `doc/decisions.md`: fold round 1 into one "replaced by widget()" line at the bottom; the current design first.
12. Width: let the widget use the page's width up to about 60em (not ~550px) so a transcript line isn't wrapped at 1920. On the Dictate page, one sentence above the ORIGINAL exhibit: it is the plain mic button that other pages embed; the playground above is the full view.

## Prove it

Headless Playwright only (`headless: true`; scripts in the session scratchpad named `dp-c-*.mjs`). At 1920×1080 on `http://127.0.0.1:62967/framework/ux/Dictate/`: shoot idle (meter visible, empty-state line), then press ▶ Sample and shoot Raw mid-run, Corrections after the run, Live 6 s after the run. Zero console errors except the known CORS line for `127.0.0.1:8090/api/tidy` (that route goes live when Servex restarts after merge). Save the pngs as `c-idle.png`, `c-raw.png`, `c-corrections.png`, `c-live.png` into `public/framework/ai/2026-09-28/dictation-playground/fixes/` in the MAIN tree.

## Log

`public/framework/ai/2026-09-28/dictation-playground/fixes/task.jsonl` in the MAIN tree (new-task shape, `group: "dictate"`, `node .claude/hooks/append.mjs`). Commit in the worktree. Report in one short message: commit hash, the four shot paths, anything unticked.
