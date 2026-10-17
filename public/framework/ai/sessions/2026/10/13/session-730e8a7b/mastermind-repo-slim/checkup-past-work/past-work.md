<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Checkup  past work discovery  the old prompts  readme indexing  salvage branches  the Whisper log" (words: checkup, past, work, discovery, old, prompt, readme, index, salvage, branch, whisper, log)

## Tasks (8, best first)
- 2026-10-15 [past-work-audits](/framework/ai/sessions/2026/10/15/voice-opus/past-work-audits/) — The three audits, described — day audit 2026-10-03 is one JSON array of 22 task records (not a file per task); branch audit 2026-10-13 is classify.json (141 branches) + absent.json + moved.json (44 each); no 2026-10-13 readme audit exists, the nearest is 2026…
- 2026-10-15 [framework/ai: readme smoke-test rule, logging, tags, asked-for summary](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/) — Rule added to the mastermind skill; framework/ai readmes audited (3 fixes, rest listed); append.mjs now stamps every line; in-memory query exists (SessionIndex + ext/Query), tags recommended; node Server/Asked.mjs answers 'didn't I ask for X?'. · paths 1/1 exist
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-15 [past-work-log](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-log/) — public/framework/ai/sessions/2026/10/15/voice-20261015/ask-8f9c9d80.md
- 2026-10-13 [Readmes: all under 100 lines, every module indexed](/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/) — Readme audit landed on michael/dev — 13 oversized readmes trimmed to under 100 lines, 93 unlisted modules now indexed, dead links 41 down to 26. Bodies moved verbatim to doc/; nothing lost. Script lists line counts, dead links, unindexed modules: audit.mjs, r… · paths 1/2 exist, gone: framework/ai/handover
- 2026-10-13 [checkup-past-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-past-work/) — public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-past-work/requirements.md
- 2026-10-13 [framework/ai: date folders gone for good, one tree decided](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store/) — No date folder left in framework/ai, and none can come back; old links still open. date directory cleaned up: 8 folders moved by script (831 files, verify 0 bad, undo tested first), 71 links relinked it can't come back: every writer goes through TaskDirs, whi… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [ext/catalog](/framework/ext/catalog/) — used by 7 files
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 3 files
- [ui/dialog](/framework/ui/dialog/) — used by 6 files

## Docs and readmes
- [Whisper debug log — read the actual log file for the whispe…](/framework/core/Page/card/log/whisper/readme.md) — The owner's own old idea, rebuilt with Logger/LogView: run a real Transcriber.Whisper against a saved clip (no mic needed), and turn every …
- [Owner notes, 2026-10-16: indexing and finding past work (di…](/framework/ai/doc/owner-2026-10-16-indexing.md) — Not a plan, not approved. The owner's words condensed. Related: past-work-index.md (by task), readmes.md, module-homes.md. ## Every directo…
- [catalog — two arrangements of previews() patched onto Page,…](/framework/ext/catalog/readme.md) — ## Use js initialize(){ this.catalog(); } // rail — the page's own content() becomes the first card const BANDS = { Surfaces: "card toolbar…
- [Whisper log: every event, numbered (2026-10-16)](/framework/audio/Whisper/doc/whisper-log.md) — What it is. [WhisperLog](/framework/audio/Whisper/log/) (WhisperLog.js) writes one line for everything between the microphone and the Clean…
- [ClipMic and the tick-by-tick log](/framework/core/Page/card/log/whisper/doc/clipmic.md) — One topic: how a saved WAV file becomes a fake microphone, and how each of Transcriber. Whisper's ticks becomes one log group. Both files o…
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [ErrorLog — a UI error becomes one log line a session can fo…](/framework/ext/ErrorLog/readme.md) — ErrorLog.watch(stateFn) once per page, ErrorLog.report(e, ctx) for caught errors. Appends to /framework/ai/errors/<date>.jsonl through the …
- [Every prompt kept in its session's log (2026-10-10)](/framework/ext/Refine/doc/session-log-2026-10-10.md) — What: a prompt refined on the Refine page is saved in the session's own folder, in prompts.jsonl, in stages. Nothing is ever overwritten. |…

## Sessions tagged with these words
- 2026/10/15 [Past-work log node script](/framework/ai/sessions/2026/10/15/session-d76f0d2e/) — kind/owner model/sonnet mod/server mod/ai/sessions task/past-work-log · $1.06
- 2026/10/16 [Past-work pilot classifier](/framework/ai/sessions/2026/10/16/session-289010e0/) — kind/owner model/haiku work/read-only task/past-work · $1.86
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53
- 2026/10/15 [Past-work audits](/framework/ai/sessions/2026/10/15/session-c19535e4/) — kind/owner model/haiku mod/ai/sessions task/past-work-audits framework/ai · $0.26

## Owner asks
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,353 tokens of reading, under the 100k limit).

Question: Checkup: past-work discovery, the old prompts, readme indexing, salvage branches, the Whisper log

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Checkup: past-work discovery, the old prompts, readme indexing, salvage branches, the Whisper log"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
