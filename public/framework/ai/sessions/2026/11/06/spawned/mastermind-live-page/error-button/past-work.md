<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Stale dictate button on the  Page Load Error  screen" (words: stale, dictate, button, load, error, screen)

## Tasks (8, best first)
- 2026-10-12 [Live-page error: auto reload hold, reload pre-flight, screenshots gate](/framework/ai/sessions/2026/10/12/session-26eee6cc/live-page-error/) — Live-page error: cause found and closed in code ([notes](/framework/dev/doc/watch.md), [STATE](/framework/ai/2026-10-12/live-page-error/STATE.md)). Cause: unheld direct edits to live sessions modules (a3275bd04, 31ef0c85d) reloaded the tab mid-batch; merge wa…
- 2026-11-06 [error-button](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/error-button/) — public/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/error-button/requirements.md
- 2026-10-13 [Dictate: one New session button, one mic indicator](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-session/) — One New session button and one mic indicator on every mic surface. one New session: sheet, AI tab and Dictate page all call chat.js's button; the other two copies are gone. Proof: proof.mjs pressed it on the 400 px sheet and the 1200 px drawer, session id to … · paths 1/2 exist, gone: framework/ux/Dictate/md/doc/chat/
- 2026-10-04 [Dictate: four owner-visible fixes — quad bubble, mic abort, instant s…](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-fixes/) — All four owner fixes landed on michael/dev (80cb509e, b4d31f83, 4cf347ad). Review: reviewed: 1 fixed, 3 noted — [review.md](review.md). Follow-ups it flagged (abort race untraced, a fast repeat silently drops, two "landed" checks) are in [decisions.md](/frame… · paths 1/2 exist, gone: framework/ai2/
- 2026-10-04 [Dictate round 2: mic-abort reload race, no mid-pause beeps, capped bo…](/framework/ai/sessions/2026/10/05/dictate-fixes-2/dictate-fixes-2/) — All five asks landed on michael/dev, proven headless and reviewed ([review.md](review.md): 1 fixed, 2 noted). reload's mic-abort race fixed: [Dictate.js](/framework/ux/Dictate/Dictate.js) retries once on AbortError. no mid-pause beeps: [Mic.js](/framework/ext… · paths 3/3 exist
- 2026-11-03 [Budget: $3. Load the minion skill first. Investigate only, read-only,…](/framework/ai/sessions/2026/11/03/session-f5eadae9/minion-mingled-chat/) — (no outcome logged)
- 2026-10-24 [fix-the-page-load-error-that-appears-aft](/framework/ai/AISession/tasks/fix-the-page-load-error-that-appears-aft/) — (no outcome logged)
- 2026-10-20 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…

## Modules that exist now (files outside the module that import it)
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 5 files
- [ux/Dictate](/framework/ux/Dictate/) — used by 34 files

## Docs and readmes
- [Does a browser voice session survive a locked phone or a ho…](/framework/ux/Dictate/doc/locked-phone-and-pwa.md) — Short answer: assume no. A browser voice session should be treated as foreground-only: when the screen locks, the mic and the speech are li…
- [How a chat is made: mic to screen](/framework/ux/Dictate/doc/pipeline.md) — The whole path of one spoken sentence, with the file that does each step. Line numbers were read from the code on 2026-10-25; if one has dr…
- [Two settings: read-aloud on/off, and a Hold button (proposa…](/framework/ux/Dictate/doc/read-aloud-and-hold.md) — Asked. (1) Read-aloud on or off (it is a bit annoying, you may turn it off), and when it is off the assistant should work differently. (2) …
- [Whisper upload: why raw text got slow on the phone, and the…](/framework/ux/Dictate/doc/upload.md) — On a slow uplink the upload is the delay, not Whisper. Every guess re-sends the whole growing segment (6 s of audio is about 190 KB as 16-b…
- [Dictate — a mic button that always shows what is happening](/framework/ux/Dictate/readme.md) — Voice Chat's guiding principles and direction (read first; the owner, 2026-11-03): never interrupt, never assume the screen is seen, the me…
- [Replay lab — press a button, reload, and see what the real …](/framework/core/Item/replay/readme.md) — Open it at [/framework/core/Item/replay/](/framework/core/Item/replay/). Four examples (start a task that spawns an agent; show, hide, togg…
- [Catalog — next: previews that load in under 2 s](/framework/catalog/doc/next.md) — The ask: "a preview on the catalog page is enough to see what it looks like" — the review's test was 40 previews in under 2 s. Today they a…
- [The error colour: too close to prime, and unreadable on dar…](/framework/design/color/doc/error-colour.md) — The owner checked Figma's error (#CC0000) on the Dark ground and found it almost invisible (about 1.1:1) and jarring. It is also close to p…

## Sessions tagged with these words
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/14 [Figma MCP skill design systems](/framework/ai/sessions/2026/10/14/session-f155ecbd/) — kind/owner model/opus mod/ai/sessions mod/ext/figma mod/ux/dictate framework/figma · $107.72
- 2026/10/13 [Dictate session duplicate buttons](/framework/ai/sessions/2026/10/13/session-e0227bd6/) — kind/owner model/sonnet mod/ux/dictate task/mastermind-repo-slim servex/voice · $2.52
- 2026/10/13 [Voice surfaces documentation](/framework/ai/sessions/2026/10/13/session-0467707f/) — kind/owner model/sonnet mod/ux/dictate mod/ai/sessions task/mastermind-repo-slim framework/sessions · $2.49

## Owner asks
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)
- 2026-09-30 AI: /framework/ai/ becomes the AI system's home, stale page deleted (task-mastermind-ai-page, building)
- 2026-09-30 Monitor: a Playwright agent on main; template changes get console + screenshot + stall ch… (mastermind-servex (10 PM, first in the task), queued)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)

## Commits
- 727f0e475e Dictate: session switcher review fixes (stale wording, mid-read close)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,988 tokens of reading, under the 100k limit).

Question: Stale dictate button on the "Page Load Error" screen

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Stale dictate button on the \"Page Load Error\" screen"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
