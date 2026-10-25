# Dictation: the Debug tab, the stall found and fixed

Branch `worktree/dictation-debug` (worktree `C:/Code/lew42/worktrees/dictation-debug`), 6 commits on michael/dev `5e6e3e0f0`, ready to merge. The full write-up is the module doc: [ux/Dictate/doc/debug-tab.md](/framework/ux/Dictate/doc/debug-tab.md).

![Debug tab on a phone](shots/debug-390.png) ![Debug tab at 1920](shots/debug-1920.png)

## What the stall was (evidence: `ux/Dictate/test/stall.mjs`, headless, fake mic, Servex stubbed)

- **One unanswered send blocked every later one.** `Session.post()` had no time limit and the mic's send queue is one promise chain. Before the fix: 1 send in 25 s of speech, the bar stuck on "Sending · one moment", no error. After: 4 sends, and the stuck one is marked "not sent" with "Servex did not answer session/say in 10 s".
- **The mic stopped silently when the chat moved** between the page, the dock and the sheet. Found while shooting 1920: the mic died a second after starting. Now the newest mic on the page takes over.
- **A failed first sentence vanished**, because starting a session wiped the screen. Now it stays, marked "not sent".
- **The mic is released on reload:** 1 of 1 tracks stopped (`pagehide`).

## What changed

- **Debug tab** (was Dictation): five live rows, one per question, with the real error. Routed as the subpath `<page>/ai/debug/`, and a reload keeps you on it (`test/debug-tab.mjs`: phone and 1920 all pass). Why a subpath: debug-tab.md#routed.
- **Bubbles and deltas:** one piece per `at`, time order inside a bubble, an ended stream stops blinking. `test/deltas.mjs`: all pass. The old code fails 3 of them ("One. One. Three. Two.").
- **Errors per module:** `ErrorLog` writes `failures.jsonl` in the module that broke, which `follow` already delivers; `app.js` watches every page. Dictation's file: [ux/Dictate/failures.jsonl](/framework/ux/Dictate/failures.jsonl). How `ai/errors/` moves to per-module logs, and the page watcher (proposed, not built): [ext/ErrorLog/doc/page-watcher.md](/framework/ext/ErrorLog/doc/page-watcher.md).
- **The UI rule** "anything that can fail tells the user what went wrong": [framework/doc/rules.md](/framework/doc/rules.md), one line in the framework readme.

## Left open, with the next step

- The AI row turns red 60 s after a send with no answer, but it cannot say why Servex's assistants were silent (asleep, held by the floor, crashed). Next: `Servex/agents/Sessions.js` writes a `{status}` line that `chat.js` already reads.
- `test/in-place.mjs` fails 4 checks on this branch and on the live site alike (its slice b predates the composer), so it was not caused here.
- `test/new-session.mjs` was not run: it starts real, paid session agents.
- The stall tests' refused sends write fallback lines into the served tree's `ai/prompts.jsonl` (the worktree's copy is changed and left uncommitted).

## Docs this made out of date (for the mastermind)

`ext/drawer/doc/tabs.md` and `doc/sheet.md` still name the Dictation tab; `ux/Dictate/surfaces/page.js` lists `tabs/dictation.js` (the file is kept, no longer loaded); `ext/ErrorLog/doc/design.md` describes the day file only.
