<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Voice models for read aloud  what Kokoro costs  and what sounds better" (words: voice, model, read, aloud, kokoro, cost, sound, better)

## Tasks (8, best first)
- 2026-10-25 [Voice sessions: filed in the dated store, costed, Opus 5.5 smart agen…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/voice-sessions/) — Voice sessions are filed, indexed and costed; the smart agent is Opus 5.5 and keeps its own record. Filed, indexed, shown with cost: v-dwlaoin, 2 child agents, $0.24 total: [shot at 1920](proof/sessions-list-1920.png) Backfill by script: 61 records moved, [ma…
- 2026-10-20 [voice-recite](/framework/ai/sessions/2026/10/20/session-e00f55c9/voice-recite/) — Read the AI's replies aloud: a local voice, a Recite playhead, barge-in (requirements.md) · paths 1/1 exist
- 2026-10-12 [Models: known-answer suite, voice and Refine on luna](/framework/ai/sessions/2026/10/12/session-728df7fd/models-asks/) — Voice assistants and Refine now run on a cheap non-Anthropic model, with a Claude fallback. 20+ task suite, 5 models, 2 thinking levels, under $5: 27 tasks, 270 calls, $0.15 ([run1.log](/framework/ai/2026-10-12/models-asks/run1.log)); table on [/framework/ai/… · paths 1/1 exist
- 2026-10-08 [Mobile setup page + mic/Whisper diagnosis: the gap is HTTPS on the LA…](/framework/ai/sessions/2026/10/08/mobile-voice-access/mobile-voice-access/) — What landed: a new page [/framework/dev/mobile/](/framework/dev/mobile/) — one screen, works/doesn't-work table first, then how to open the site on a phone and fix the mic. [findings.md](/framework/ai/2026-10-08/mobile-voice-access/findings.md) answers all 4 … · paths 2/2 exist
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…
- 2026-10-20 [voice-models](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/voice-models/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/voice-models/requirements.md
- 2026-10-04 [minion-cost-model](/framework/ai/sessions/2026/10/04/message-cost/message-cost/minion-cost-model/) — (no outcome logged)
- 2026-10-04 [OpenRouter cost: price() reads usage.cost, 3 unpriced calls gate, spa…](/framework/ai/sessions/2026/10/04/openrouter-cost-blind/openrouter-cost-blind/) — Fixed: an OpenRouter agent's real cost was invisible to the spend limit. The old /generation poll swallowed every miss as a silent $0. OpenRouter's own response already carries the real price (usage.cost); price() now reads it instantly, logs any miss instead…

## Docs and readmes
- [Voice — one voice that turns text into speech](/framework/audio/Voice/readme.md) — A Voice is one voice, a persona: a name, a recite-server voice id and a speed. It is the output half of the mic pair: Transcriber turns spe…
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [Local Models — talk to a model running on this machine's ow…](/framework/ai/local/readme.md) — ## What This page (page.js) is a small chat box wired to Servex's local provider instead of Claude or OpenRouter: pick a model from the dro…
- [Models: which agent runs on what](/framework/ai/models/readme.md) — The table is drawn from now.json, which node Server/ModelsNow.mjs --write computes (roles.js, the live registry, the OpenRouter spend log, …
- [Recite — reads the AI's replies aloud](/framework/audio/Recite/readme.md) — Recite is text to speech, the reverse of transcription. It reads a reply out loud with a local voice, so you can use the site on a walk wit…
- [Sound recorder — MicPicker + LevelMeter + Recorder](/framework/audio/v1/sound-recorder/readme.md) — Three independent audio/ classes, wired by this one page: MicPicker chooses the device, LevelMeter watches its level, Recorder records, pla…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — > Superseded 2026-10-26 (the owner): a task now stays in the session that files it; a module folder only with an explicit home. Read [the r…
- [Refine stages — the live stages of a voice prompt](/framework/ext/Refine/stages/readme.md) — Each stage of a spoken prompt (raw, things you mentioned, clean, structure, refined, cards) is drawn live on the session page by its own cl…

## Sessions tagged with these words
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27
- 2026/10/15 [Clarity voice session](/framework/ai/sessions/2026/10/15/session-cbce90d6/) — kind/agent model/sonnet work/read-only task/voice-20261015. framework/ai · $0.23
- 2026/10/14 [Clarity voice connector](/framework/ai/sessions/2026/10/14/session-9a02d4eb/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/voice · $0.15
- 2026/10/13 [Refine confidence](/framework/ai/sessions/2026/10/13/session-eec4b153/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim cost/compact · $2.45
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90

## Owner asks
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)

## Commits
- 9b4fe7c98 Voice sessions: real titles, folder tracks the title, no more "no session undefined"
- 6e7a058d6 ai: voice-chat-cards-and-model-context proposal (read-only investigation)
- d0c6b6691 one-dictation: the fast assistant refines each owner utterance, live, with its cost

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Voice models for read-aloud: what Kokoro costs, and what sounds better

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Voice models for read-aloud: what Kokoro costs, and what sounds better"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
