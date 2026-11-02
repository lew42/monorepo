<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Read aloud  resume after barge in  karaoke follow with phrase streaming  tap to pause" (words: read, aloud, resume, after, barge, karaoke, follow, phrase, stream, tap, pause)

## Tasks (8, best first)
- 2026-10-20 [read-aloud-next](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/read-aloud-next/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/read-aloud-next/requirements.md
- 2026-10-20 [docs-check: core/Session and core/Task readmes after Session entries](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-entries/docs-check/) — (no outcome logged)
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-18 [Follow-up: counted by the one state](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/followup-state/) — FollowUp now reads the one state. Server/FollowUp.mjs takes its tasks, buckets and agents from State (ai/state.json when under a minute old, else a fresh snapshot); its own folder walk and its own "landed" test are gone. each kind mapped to the state, in this…
- 2026-10-04 [Dictate follow-ups: superseded by dictate-fixes-2](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-followups/) — Superseded, not started. The same four asks (mid-sentence beeps, no restart on silence, a 2-3 line box, self-clearing errors) plus the mic-abort race are already running as [dictate-fixes-2](/framework/ai/2026-10-04/dictate-fixes-2/). Closed here so nothing b…
- 2026-10-04 [OpenRouter cost: price() reads usage.cost, 3 unpriced calls gate, spa…](/framework/ai/sessions/2026/10/04/openrouter-cost-blind/openrouter-cost-blind/) — Fixed: an OpenRouter agent's real cost was invisible to the spend limit. The old /generation poll swallowed every miss as a silent $0. OpenRouter's own response already carries the real price (usage.cost); price() now reads it instantly, logs any miss instead…
- 2026-10-02 [Framework cards: size follows weight, unread badges scaffolded](/framework/ai/sessions/2026/10/02/framework-home/weight-badges/) — Landed. /framework/ cards now size by weight (core/Page/weight/weight.js, reused): a heavy module shows its readme's own live ## Architecture excerpt, everything else is icon + name only. big card shows live architecture excerpt — [Page/Item/List cards](/fram…

## Docs and readmes
- [Recite — reads the AI's replies aloud](/framework/audio/Recite/readme.md) — Recite is text to speech, the reverse of transcription. It reads a reply out loud with a local voice, so you can use the site on a walk wit…
- [MicStream — opens a microphone, hands out its stream, sampl…](/framework/audio/MicStream/readme.md) — new MicStream() opens one microphone (a device_id, else ux/Dictate's remembered pick, else the system default) and gives everything else in…
- [Transcriber — an audio stream in, a text stream out](/framework/audio/Transcriber/readme.md) — Three engines, one shape: on_partial(text) (a still-improving guess — ephemeral, never write this to disk) and on_final(text) (one COMMITTE…
- [LevelMeter — a live level bar for any MicStream](/framework/audio/v1/LevelMeter/readme.md) — watch(mic) points it at a MicStream; mic.on_level() drives the bar's --level custom property directly, so a fast-moving meter never trigger…
- [Push-to-talk stream — Discord-style, local only](/framework/audio/v1/push-to-talk/readme.md) — PushToTalk opens a MicStream while its button (or Space) is held, and hands the raw MediaStream to whoever is listening through on_start(st…
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…
- [Voice models for read-aloud: what Kokoro costs, and what so…](/framework/audio/Recite/doc/voice-models.md) — The answer: Kokoro is cheap to run (about 1.3 GB of RAM, no GPU, 1.2 s to speak a 21-word sentence) but it is a small 82M-parameter model, …
- [Socket — one WebSocket to the dev server; the transport eve…](/framework/dev/Socket/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Dictate framework component](/framework/ai/sessions/2026/10/16/session-e99e8190/) — kind/owner model/sonnet work/read-only · $0.13
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)
- 2026-09-30 Selection: tap to select and drill down on mobile; the AI knows the element (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 AI 2 tab leak: pollers pause while hidden (minion-ai2-soak, landed)

## Commits
- fcb8938d4 dictation-v3: briefs for read-aloud-next (resume, karaoke follow + phrase streaming, tap to pause) and ink-ch…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Read-aloud: resume after barge-in, karaoke follow with phrase streaming, tap to pause

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Read-aloud: resume after barge-in, karaoke follow with phrase streaming, tap to pause"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
