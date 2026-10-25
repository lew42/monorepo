<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  demo pages write fake runs into the real Whisper log" (words: dictation, demo, write, fake, run, into, real, whisper, log)

## Tasks (8, best first)
- 2026-09-30 [Whisper debug log: a real Transcriber.Whisper run, logged tick by tick](/framework/ai/sessions/2026/09/30/cards-and-logs/cards-and-logs/whisper/) — Whisper debug log landed, plus three Logger/LogView fixes (tight line spacing, a plain heading toggle, log- registered in css-scopes.txt). a real Transcriber.Whisper run against a saved clip or the mic — whisper/ClipMic.js, whisper/Instrument.js one card per … · paths 1/1 exist
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-17 [Checkup: finding past work, salvage branches, Whisper log](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-past-work/) — Sessions search now matches digest tags (live, 163fa78d0); PastWork gained --brief (Haiku-searcher prompt with the readme chain) and --task (writes past-work.md beside a task), in the past-work skill; salvage top 5 set aside with a dated note, none deleted; a…
- 2026-10-17 [Whisper log page](/framework/ai/sessions/2026/10/16/voice-20261016/whisper-log/) — Closed by mastermind-checkup-past-work: the page /framework/audio/Whisper/log/ is on michael/dev (3cecf3724) and renders; its log shows 0 events until a dictation page writes to it, which is expected, not a bug. · paths 1/1 exist
- 2026-09-30 [audio: three tools, one demo, one dictation widget](/framework/ai/sessions/2026/09/30/108a1b36-ed02-4728-bf82-20d7d7053d85/audio-consolidate/) — audio/ is three tools with one live demo, and one dictation widget runs the sheet, drawer and card pages. [/framework/audio/](/framework/audio/) · [/framework/ux/Dictate/](/framework/ux/Dictate/) · merged 5c1b7d15 ![](minion-audio/demo-live-1920.png) MicStrea… · paths 3/3 exist
- 2026-09-30 [Cards: dark ink on the orange card, a real bold word, a visible gray,…](/framework/ai/sessions/2026/09/30/cards-and-logs/cards-and-logs/review-fix-2/) — All 4 review findings fixed, reviewed, committed — not yet merged. #1 dark ink on .card-prim: 4.69:1 both modes #2 whisper's literal asterisks now a real strong() #3 .card-gray is --darken-1, visible on any ground #4 Log's first demo shows a group before any … · paths 4/4 exist
- 2026-09-29 [Dictation to brief: refine.mjs, coverage audit, and an honest check o…](/framework/ai/sessions/2026/09/29/a918d03d-6afe-4958-b425-20e9eba998ef/prompt-refine/) — Server/refine.mjs turns a dictation into clean, structured and brief rungs, traces every sentence you said, and repairs what it drops. It is on the card beside an audit of the VS Code tab. Over budget: $47 against $10. ![run C, ask 1 clicked: its source light… · paths 1/2 exist, gone: framework/ai2/2026/09/29/from-dictation-to-a-brief-with-nothing-l/
- 2026-09-29 [Skills audit: two real trigger gaps, one blind spot in the log itself](/framework/ai/sessions/2026/09/29/servex-mastermind/audit/skills/) — What landed — [report.md](/framework/ai/2026-09-29/servex-mastermind/audit/skills/report.md): 4 tables (inventory, invocations, trigger gaps, stale/missing) plus 3 findings, read-only. - new-task fired 1 time while 146 task dirs opened this week; new-page fir…

## Modules that exist now (files outside the module that import it)
- [ext/catalog](/framework/ext/catalog/) — used by 7 files
- [ext/demo](/framework/ext/demo/) — used by 62 files
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 5 files
- [ui/dialog](/framework/ui/dialog/) — used by 6 files

## Docs and readmes
- [ClipMic and the tick-by-tick log](/framework/core/Page/card/log/whisper/doc/clipmic.md) — One topic: how a saved WAV file becomes a fake microphone, and how each of Transcriber. Whisper's ticks becomes one log group. Both files o…
- [Whisper debug log — read the actual log file for the whispe…](/framework/core/Page/card/log/whisper/readme.md) — The owner's own old idea, rebuilt with Logger/LogView: run a real Transcriber.Whisper against a saved clip (no mic needed), and turn every …
- [The Whisper demo: every reply from the speech server, as it…](/framework/audio/Whisper/doc/demo.md) — The demo at the top of the [Whisper page](/framework/audio/Whisper/) shows each answer whisper-server sends back, one row per answer, newes…
- [Is the raw Whisper reply saved? (checked 2026-10-17)](/framework/audio/Whisper/doc/raw-log.md) — Update 2026-10-20: Dictate now writes every reply to the WhisperLog bucket instead of Servex's whisper-raw log, so the [Whisper page](/fram…
- [Whisper log: every event, numbered (2026-10-16)](/framework/audio/Whisper/doc/whisper-log.md) — What it is. [WhisperLog](/framework/audio/Whisper/log/) (WhisperLog.js) writes one line for everything between the microphone and the Clean…
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [Proposal (not built): re-run a page when its files change, …](/framework/ext/ErrorLog/doc/page-watcher.md) — The owner, 2026-10-24: errors are logged per page and per module, so we know the moment one happens, and the goal is pages with zero errors…
- [Whisper log, and where the period comes from (2026-10-09)](/framework/ux/Dictate/doc/whisper-log.md) — > Moved 2026-10-16: WhisperLog now lives in audio/Whisper/ and logs every step, not only the replies; see audio/Whisper/doc/whisper-log.md.…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-18 Logs: validated writes only; shell appends to .jsonl blocked (?, tracked)

## Commits
- 0fa85bdb0 one-input: composer() textarea shape (1→5 lines), mic→refine wiring, Refine demo onto composer

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictation: demo pages write fake runs into the real Whisper log

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: demo pages write fake runs into the real Whisper log"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
