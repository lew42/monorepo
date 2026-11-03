<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "V1  raw transcripts disappear  urgent " (words: raw, transcript, disappear, urgent)

## Tasks (8, best first)
- 2026-10-24 [Task pages: old screenshots draw again (no 403)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/shot-paths/) — Old task pages draw their screenshots again no 403: a shot path inside public/ or relative to the task folder is drawn from the site, only when the folder lists it (catalog/ shows its 1200x1000 shot, dictate-sheet/ its 400x800; 0 4xx live) ask cards resolve t…
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-13 [Session detail: Raw links and per-ask transcript line](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-detail-raw/) — Header shows task.jsonl + transcript links; each Coverage ask links to its transcript line; Coverage stays empty where no refined cards exist (ext/Refine side, untested on real asks). Committed 566b6926f; no merge.mjs run (main-tree edit).
- 2026-09-29 [Clean transcription mode: the composer's box shows tidied text, raw s…](/framework/ai/sessions/2026/09/29/audio/audio/next-clean-transcription/a-clean-mode/) — Clean transcription mode shipped in AI 2's composer — proof: shots/2..4 (a raw filler-heavy sentence typed in, cleaned in place, dug back with the raw toggle), shots/5-6 (playground's new Clean tab). clean mode is the composer's default: ai2/compose.js now se… · paths 3/3 exist
- 2026-10-17 [checkup refine+voice: raw Whisper save, Placement, sessions decision](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-refine-voice/) — Raw Whisper replies saved to the whisper-raw log; Placement built and merged; New session button tested (demo key bug fixed); one rolling session chosen with the button as escape hatch; Servex restart still needed for the lag fix.
- 2026-10-13 [ext/drawer: the phone sheet's full state is the sidebar's tabs](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/) — The sheet's full state mounts the drawer tab row and body under the chat; mic keeps listening; mic-proof passes; merged 6441b0642 (change 4cb0adf91). 400 px shots only; 1200/1920/3440 layout-check not run.
- 2026-10-12 [Dictate: merged transcription asks, two small builds](/framework/ai/sessions/2026/10/12/session-d2954950/asks-transcription/) — Merged asks doc: [Transcription asks](/framework/ux/Dictate/doc/asks.md), 19 clusters (7 open, 4 partly, 8 done), linked from the [Dictate readme](/framework/ux/Dictate/). Two small builds: Refine keeps the latest 19,000 characters of a long prompt; the voice… · paths 1/1 exist
- 2026-10-12 [Server: Whisper survives a Servex restart](/framework/ai/sessions/2026/10/12/session-e4a1482d/transcription-crash/) — Dictation broke because every Servex restart killed Whisper (2 to 14 s to reload); Whisper now outlives Servex and is adopted by the next one. a loop that dictates and reloads the page: [Server/TranscribeLoop.mjs](/Server/TranscribeLoop.mjs); 10 min with file…

## Modules that exist now (files outside the module that import it)
- [ext/drawer](/framework/ext/drawer/) — used by 16 files
- [ext/sprawl](/framework/ext/sprawl/) — used by 1 files

## Docs and readmes
- [Is the raw Whisper reply saved? (checked 2026-10-17)](/framework/audio/Whisper/doc/raw-log.md) — Update 2026-10-20: Dictate now writes every reply to the WhisperLog bucket instead of Servex's whisper-raw log, so the [Whisper page](/fram…
- [Binding — draw a value once, and it keeps itself up to date](/framework/core/Page/doc/binding.md) — Binding means a view on screen is tied to the data it shows. When the data changes, the view changes with it, and nobody has to remember to…
- [Reachability — the crawl, the audit, and what the probe cha…](/framework/doc/reachability.md) — ## The method, and there are two halves Both are scratch scripts rather than repo scripts — a work-in-progress check doesn't earn an npm sc…
- [drawer architecture — one rail that pushes the page, filled…](/framework/ext/drawer/doc/architecture.md) — ext/drawer is the site's one right-hand rail, for context, tools and help beside the page. Its main entry is drawer(fn) in [drawer.js](../d…
- [drawer — decisions and record](/framework/ext/drawer/doc/decisions.md) — *moved from readme.md 2026-08-17; conclusive, not current guidance.* fn($slot, $body) fills two slots. $slot is the caller's half of the pi…
- [Inbox](/framework/ext/drawer/doc/inbox.md) — ![Two notes in the page's inbox, at the top of the AI tab: who left each (a mastermind wears the M), how long ago, Clear](/framework/ext/dr…
- [Owner notes, 2026-10-16 (night): the mobile sheet, the draw…](/framework/ext/drawer/doc/owner-2026-10-16-sheet.md) — A big surgery. A mastermind manages it, a worktree tests it, and the owner approves each step before it is built. Slow and methodical; mock…
- [Sheet.js comment notes (the file was rail.js until 2026-10-…](/framework/ext/drawer/doc/rail-notes.md) — Comments pruned from rail.js, now Sheet.js (2026-10-12), kept verbatim, in file order. The headings keep the old names (DrawerRail is Sheet…

## Sessions tagged with these words
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/13 [Repo slim: AI system, architecture, assistant cha…](/framework/ai/sessions/2026/10/13/session-decd2604/) — kind/owner model/haiku work/read-only servex/transcripts · $0.18
- 2026/10/13 [Drawer architecture documentation](/framework/ai/sessions/2026/10/13/session-32afe0f6/) — kind/owner model/haiku mod/ext/drawer mod/ai/sessions task/mastermind-repo-slim docs/architecture · $0.30

## Owner asks
- 2026-10-03 Drawer: tight header, one scroll area, composer footer flush with default padding (task-mastermind-drawer-cleanup, building)
- 2026-10-12 Why the site crashes during transcription and reload (mastermind-transcription-crash, landed)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: V1: raw transcripts disappear (urgent)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "V1: raw transcripts disappear (urgent)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
