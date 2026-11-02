<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Raw Whisper text  fast again  and readable dim to strong  you are a mastermind " (words: raw, whisper, text, fast, again, readable, dim, strong, you, mastermind)

## Tasks (8, best first)
- 2026-10-23 [You are a fresh session of ai-system-mastermind, replacing session 56…](/framework/ai/sessions/2026/10/23/spawned/ai-system-mastermind-2/) — (no outcome logged)
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-09-29 [Clean transcription mode: the composer's box shows tidied text, raw s…](/framework/ai/sessions/2026/09/29/audio/audio/next-clean-transcription/a-clean-mode/) — Clean transcription mode shipped in AI 2's composer — proof: shots/2..4 (a raw filler-heavy sentence typed in, cleaned in place, dug back with the raw toggle), shots/5-6 (playground's new Clean tab). clean mode is the composer's default: ai2/compose.js now se… · paths 3/3 exist
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/
- 2026-10-25 [text-check: skip generated files, read the newest outcome](/framework/ai/sessions/2026/10/25/spawned/mastermind-ai/) — Stop text-check flagging generated past-work.md: files headed "do not hand-edit" are now skipped ([text-check.mjs](/Server/text-check.mjs), d3c12608e). A rewrite after landing clears a stale flag: the newest outcome is the one checked. Proof: clean run on mas…
- 2026-10-24 [Task pages: old screenshots draw again (no 403)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/shot-paths/) — Old task pages draw their screenshots again no 403: a shot path inside public/ or relative to the task folder is drawn from the site, only when the folder lists it (catalog/ shows its 1200x1000 shot, dictate-sheet/ its 400x800; 0 4xx live) ask cards resolve t…
- 2026-10-17 [checkup refine+voice: raw Whisper save, Placement, sessions decision](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-refine-voice/) — Raw Whisper replies saved to the whisper-raw log; Placement built and merged; New session button tested (demo key bug fixed); one rolling session chosen with the button as escape hatch; Servex restart still needed for the lag fix.
- 2026-09-30 [AI 2: two redraw hot spots cached (Groups.members, the Live card's la…](/framework/ai/sessions/2026/09/30/inbox-ext/ai2-hang/) — The freeze is fixed, plus four owner follow-ups, all in the worktree, ready to merge. Fix the freeze — two redraw hot spots cached. Commit 6db94ad4, [profile.md](./profile.md) The × button's stretched shape and dead hover — commit a3303915 A pinned Now card a… · paths 2/3 exist, gone: framework/ai2/now/

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/drawer](/framework/ext/drawer/) — used by 16 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ext/sprawl](/framework/ext/sprawl/) — used by 1 files

## Docs and readmes
- [Is the raw Whisper reply saved? (checked 2026-10-17)](/framework/audio/Whisper/doc/raw-log.md) — Update 2026-10-20: Dictate now writes every reply to the WhisperLog bucket instead of Servex's whisper-raw log, so the [Whisper page](/fram…
- [Silence — why whisper kept saying "Thank you"](/framework/ux/Dictate/doc/silence.md) — Whisper never answers "I heard nothing". Handed a recording with no speech in it, it invents the most likely sentence instead, and for the …
- [How Whisper hears you: one timeline](/framework/ux/Dictate/doc/whisper-timeline.md) — Whisper (the speech-to-text server) only ever sees a recorded clip, never a live stream. The page cuts your talking into segments, and for …
- [Mic → Whisper → text](/framework/audio/v1/mic-to-text/readme.md) — MicStream opens the mic and keeps the sample buffer Transcriber.Whisper needs; Transcriber.Whisper resends the growing segment every ~900ms…
- [Layout architecture — one toolbar steers anything, and the …](/framework/ext/layout/doc/architecture.md) — Layout is a toolbar and a right-hand drawer for demo and guide pages that let the reader arrange things. Entry: [layout.js](../layout.js) (…
- [The drawer pushes](/framework/ext/layout/doc/drawer.md) — panel.js opens one right-hand drawer per document. It pushes the app shell over rather than covering it — the one thing a live properties p…
- [The layout text syntax](/framework/styles/layouts/space/doc/syntax.md) — A layout is a string. Indentation is nesting, one line is one box, and the whole grammar is a single production: <class tokens> > <part> [c…
- [Whisper debug log — read the actual log file for the whispe…](/framework/core/Page/card/log/whisper/readme.md) — The owner's own old idea, rebuilt with Logger/LogView: run a real Transcriber.Whisper against a saved clip (no mic needed), and turn every …

## Sessions tagged with these words
- 2026/10/13 [Layout architecture documentation](/framework/ai/sessions/2026/10/13/session-abc4b9cc/) — kind/agent model/haiku mod/core/layout task/mastermind-repo-slim docs/architecture · $0.19
- 2026/10/13 [Minion arch styles layouts](/framework/ai/sessions/2026/10/13/session-619dc8c1/) — kind/agent model/haiku mod/styles/layouts task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/13 [Drawer architecture documentation](/framework/ai/sessions/2026/10/13/session-32afe0f6/) — kind/owner model/haiku mod/ext/drawer mod/ai/sessions task/mastermind-repo-slim docs/architecture · $0.30
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)

## Commits
- e63c7f158 Fix mobile-nav review findings: freeze v1, sheet double-caption, breakpoint stop, sample content
- a4d3b79a0 Dictate: real mic feedback + subclassable variants (deliverables 3-4)
- 34013f901 Fix: the drawer's selected-element chip never reached the card-assistant
- 961d94e5a refine.mjs: doc + the three skill paragraphs (deliverables 6, 7, and ask-1's findings)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Raw Whisper text: fast again, and readable dim-to-strong (you are a mastermind)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Raw Whisper text: fast again, and readable dim-to-strong (you are a mastermind)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
