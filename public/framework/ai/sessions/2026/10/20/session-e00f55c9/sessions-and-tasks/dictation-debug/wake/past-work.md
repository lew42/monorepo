<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  wake the voice session s smart agent per thought  not per sentence  and measure the tokens" (words: dictation, wake, voice, session, smart, agent, per, thought, not, sentence, measure, token)

## Tasks (8, best first)
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-09-30 [Voice sessions: a fast and smart pair per ✦ session](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/) — Press ✦ and talk: one session follows you across pages, a fast reply in about 1 s, a smart one after. Live after the held Servex restart. fast + smart pair per session: fast 1.1 s, smart 4 s, live test resume within the hour, older session as one line: [shot]… · paths 1/1 exist
- 2026-10-19 [Cloud voice agent: guide, cloud-voice-<name> sessions, cloud_voice_log](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — Slice 3 landed (02a37b41d). Guide Servex/ext/remote/doc/cloud-voice-agent.md; the server instructions carry one pointer line; sessions are cloud-voice-<title> with a null cost field; the owner's correction applied: one cloud-only cloud_voice_log tool replaces…
- 2026-10-17 [checkup refine+voice: raw Whisper save, Placement, sessions decision](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-refine-voice/) — Raw Whisper replies saved to the whisper-raw log; Placement built and merged; New session button tested (demo key bug fixed); one rolling session chosen with the button as escape hatch; Servex restart still needed for the lag fix.
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-17 [Sessions: voice assistant becomes the default seat (follow-up)](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-wake/) — Landed, live after a Servex restart — the voice assistant is now the default; fast is the escape hatch. default voice: unit tests pass (21 checks) survives a restart: the file session-assistant.txt in the Servex home folder wins, then the env var, then voice …
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Property](/framework/core/Property/) — used by 3 files
- [core/Session](/framework/core/Session/) — used by 15 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [Session — one ✦ press is one voice session, answered by a f…](/framework/ext/Session/readme.md) — A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one dated folder: /framework/ai/…
- [Owner notes, 2026-10-16 (night): seeing tasks (dictated; ca…](/framework/core/Task/doc/owner-2026-10-16-ui.md) — Fourth note of the day. The point of the task system: see what was asked for, see what is done, keep working on what is not. Read the three…
- [Writing a theme — a theme is a class that sets tokens, noth…](/framework/styles/layers/theme/guide/readme.md) — ## Use css @layer theme { .theme-paper { color-scheme: light dark; --prime: light-dark(#9a5b28, #e0a35e); --ink: light-dark(#2c2622, #ece4d…
- [A per-module log view (a note, not built)](/framework/ai/doc/module-log-view.md) — The owner's idea (2026-10-24, item 8 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): every m…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Owner notes, 2026-10-16: a full voice conversation (dictate…](/framework/audio/Voice/doc/owner-2026-10-16-voice-conversation.md) — Not a plan, not approved. The owner's words condensed so a later session can find them. Past work on voice output: this module (Voice.js, b…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…

## Sessions tagged with these words
- 2026/10/13 [Clarity compaction dryrun](/framework/ai/sessions/2026/10/13/session-d6c0c076/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim dictation/clarity · $0.15
- 2026/10/13 [Voice e2e review](/framework/ai/sessions/2026/10/13/session-88d88920/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim dictation/clarity · $0.26
- 2026/10/13 [Clarity scripts rename](/framework/ai/sessions/2026/10/13/session-85748c87/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim dictation/clarity · $0.15
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-03 Styles: cards + prose on one measure/margin (lab); default padding rule; adaptive bg-ligh… (task-mastermind-card-measure-colors, building)

## Commits
- b1c45d675 ai: agent-base 15, legacy sweep (OpenRouter-only directive, task-mastermind folded into mastermind); dictatio…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,806 tokens of reading, under the 100k limit).

Question: Dictation: wake the voice session's smart agent per thought, not per sentence, and measure the tokens

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: wake the voice session's smart agent per thought, not per sentence, and measure the tokens"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
