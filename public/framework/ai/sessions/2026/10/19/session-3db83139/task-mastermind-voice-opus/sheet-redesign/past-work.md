<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictate sheet  the mic is the level meter  tabs move into the AI menu" (words: dictate, sheet, mic, level, meter, tab, move, into, menu)

## Tasks (8, best first)
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-13 [Dictate: one New session button, one mic indicator](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-session/) — One New session button and one mic indicator on every mic surface. one New session: sheet, AI tab and Dictate page all call chat.js's button; the other two copies are gone. Proof: proof.mjs pressed it on the 400 px sheet and the 1200 px drawer, session id to … · paths 1/2 exist, gone: framework/ux/Dictate/md/doc/chat/
- 2026-10-13 [ext/drawer: the phone sheet's full state is the sidebar's tabs](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/) — The sheet's full state mounts the drawer tab row and body under the chat; mic keeps listening; mic-proof passes; merged 6441b0642 (change 4cb0adf91). 400 px shots only; 1200/1920/3440 layout-check not run.
- 2026-10-01 [✦ sheet: closing it no longer stops the mic](/framework/ai/sessions/2026/10/01/sheet-close-keep-mic/sheet-close-keep-mic/) — What landed: closing the ✦ sheet now leaves the mic running, as asked. auto-start mic on open — unchanged closing the sheet (✕, drag down, phone back) no longer stops the mic — its own hide() was calling stop_mic() on every close; that was the whole bug, not … · paths 2/3 exist, gone: framework/ext/drawer/doc/sheet/
- 2026-09-29 [Audio: a library of audio parts, Revise levels, one chat widget](/framework/ai/sessions/2026/09/29/audio/audio/) — [/framework/audio/](/framework/audio/) is live: six audio parts, three demos, a steadier Whisper. [ux/Revise](/framework/ux/Revise/) cleans dictation at three levels. Two reviews: 5 fixed, 2 declined ([review.md](/framework/ai/2026-09-29/audio/review.md)). Ab… · paths 5/5 exist
- 2026-10-13 [AITask: moved from ext/ into ai/, with the rule for what goes in ai/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/) — AITask now lives in ai/, and the rule for what goes there is written down. ext/AITask is an AI thing: moved to [ai/AITask](/framework/ai/AITask/) by script (223 files relinked); the [old address](/framework/ext/AITask/) points to it; check_page is clean on bo… · paths 2/2 exist
- 2026-10-04 [Dictate: four owner-visible fixes — quad bubble, mic abort, instant s…](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-fixes/) — All four owner fixes landed on michael/dev (80cb509e, b4d31f83, 4cf347ad). Review: reviewed: 1 fixed, 3 noted — [review.md](review.md). Follow-ups it flagged (abort race untraced, a fast repeat silently drops, two "landed" checks) are in [decisions.md](/frame… · paths 2/2 exist
- 2026-10-04 [Dictate round 2: mic-abort reload race, no mid-pause beeps, capped bo…](/framework/ai/sessions/2026/10/05/dictate-fixes-2/dictate-fixes-2/) — All five asks landed on michael/dev, proven headless and reviewed ([review.md](review.md): 1 fixed, 2 noted). reload's mic-abort race fixed: [Dictate.js](/framework/ux/Dictate/Dictate.js) retries once on AbortError. no mid-pause beeps: [Mic.js](/framework/ext… · paths 3/3 exist

## Modules that exist now (files outside the module that import it)
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/menu](/framework/ui/menu/) — used by 11 files
- [ui/table](/framework/ui/table/) — used by 9 files
- [ux/Dictate](/framework/ux/Dictate/) — used by 29 files
- [ux/Menu](/framework/ux/Menu/) — used by 6 files

## Docs and readmes
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [LevelMeter — a live level bar for any MicStream](/framework/audio/v1/LevelMeter/readme.md) — watch(mic) points it at a MicStream; mic.on_level() drives the bar's --level custom property directly, so a fast-moving meter never trigger…
- [Sound recorder — MicPicker + LevelMeter + Recorder](/framework/audio/v1/sound-recorder/readme.md) — Three independent audio/ classes, wired by this one page: MicPicker chooses the device, LevelMeter watches its level, Recorder records, pla…
- [Dictate — usage, design and mechanics in full (moved from t…](/framework/ux/Dictate/doc/readme-full-2026-10-12.md) — <!-- moved verbatim from readme.md lines 13-374, 2026-10-12 readme audit --> ## Use js import Dictate, { dictate } from "/framework/ux/Dict…
- [ai — the page tabs, in full (moved from the readme)](/framework/ai/doc/readme-full-2026-10-12.md) — <!-- moved verbatim from readme.md lines 5-13, 2026-10-12 readme audit --> The page has three tabs: - Inbox (the default): a rail of what n…
- [MicStream — opens a microphone, hands out its stream, sampl…](/framework/audio/MicStream/readme.md) — new MicStream() opens one microphone (a device_id, else ux/Dictate's remembered pick, else the system default) and gives everything else in…
- [Widget — the one dictation widget, configured](/framework/ux/Dictate/doc/widget.md) — Widget.js is the ✦ sheet's own compact widget (a framed card: bubbles on top, a composer row — typed box, mic, Send — at the bottom) pulled…
- [playground — what the playground is (moved from the readme)](/framework/ux/Dictate/playground/doc/what.md) — <!-- moved verbatim from readme.md lines 8-56, 2026-10-12 readme audit --> ## What Everything a 🎤 session creates, as real objects you can…

## Sessions tagged with these words
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/14 [Figma MCP skill design systems](/framework/ai/sessions/2026/10/14/session-f155ecbd/) — kind/owner model/opus mod/ai/sessions mod/ext/figma mod/ux/dictate framework/figma · $107.72
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21
- 2026/10/13 [Dictate session duplicate buttons](/framework/ai/sessions/2026/10/13/session-e0227bd6/) — kind/owner model/sonnet mod/ux/dictate task/mastermind-repo-slim servex/voice · $2.52
- 2026/10/13 [Ux/Menu architecture](/framework/ai/sessions/2026/10/13/session-aa337887/) — kind/agent model/haiku mod/ux/menu task/mastermind-repo-slim docs/architecture · $0.16
- 2026/10/13 [UI menu architecture](/framework/ai/sessions/2026/10/13/session-785ec8da/) — kind/owner model/haiku mod/ui/menu task/mastermind-repo-slim docs/architecture · $0.21

## Owner asks
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-10-13 Dictation: sheet shows the chat and mic; release the mic when hidden (?, landed)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 AI 2 tab leak: pollers pause while hidden (minion-ai2-soak, landed)

## Commits
- f7535adce ux/Dictate: DictationBar, the phone sheet's one big mic (tap, hold, Type, no Send)
- 88765fcf9 sheet step 10: the dictation redesign, mocks first
- f3da24a46 Dictate: no page.jsonl 404 on open, no stale Mic line after stop, sheet defaults to 60dvh; next.md Next 4 mar…
- 6441b0642 Merge branch 'worktree/dictate-sheet' into michael/dev
- 862d5b124 Merge michael/dev into dictate-sheet
- c92aa1c12 Dictate: prove phone-width mic transcription (LAN https), record sheet-vs-sidebar gap
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- a474261a5 Merge 11, one widget (worktree/onewidget-serve ← worktree/dictate-onewidget 1ca13652): the Dictate demo makes…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,892 tokens of reading, under the 100k limit).

Question: Dictate sheet: the mic is the level meter, tabs move into the AI menu

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictate sheet: the mic is the level meter, tabs move into the AI menu"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
