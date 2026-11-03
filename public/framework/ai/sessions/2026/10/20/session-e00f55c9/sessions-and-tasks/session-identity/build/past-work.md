<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session identity  per session turns and the identity check" (words: session, identity, per, turn, check)

## Tasks (8, best first)
- 2026-10-20 [Session identity: per-session turns and the identity check](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/build/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/build-brief.md
- 2026-10-17 [Checkup: finding past work, salvage branches, Whisper log](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-past-work/) — Sessions search now matches digest tags (live, 163fa78d0); PastWork gained --brief (Haiku-searcher prompt with the readme chain) and --task (writes past-work.md beside a task), in the past-work skill; salvage top 5 set aside with a dated note, none deleted; a…
- 2026-10-17 [checkup refine+voice: raw Whisper save, Placement, sessions decision](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-refine-voice/) — Raw Whisper replies saved to the whisper-raw log; Placement built and merged; New session button tested (demo key bug fixed); one rolling session chosen with the button as escape hatch; Servex restart still needed for the lag fix.
- 2026-10-25 [Sessions: every session listed; one index.jsonl per scope](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-indexes/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-indexes/requirements.md
- 2026-10-24 [check-whether-the-sessions-cost-breakdow](/framework/ai/AISession/tasks/check-whether-the-sessions-cost-breakdow/) — (no outcome logged)
- 2026-10-18 [Load the clarity skill, then check this proposal: public/framework/ai…](/framework/ai/sessions/2026/10/18/spawned/clarity-restart-sweep/) — Checked the restart-sweep proposal: text-check clean, verdict clear, logged in clarity/flags.jsonl. No edits.
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-16 [Sessions and accounting checkup: commit rule, cost fix proven, usage …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sessions/) — Four tasks finished, one closed; one Servex restart needed. accounting R1-R17: closed, one verdict each, recorded in the AISession module cost fix: recost of 2026-10-16 is 86.3706 before and after over 219 sessions; needs a Servex restart to be live usage pac… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Property](/framework/core/Property/) — used by 3 files
- [core/Session](/framework/core/Session/) — used by 14 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [Is the raw Whisper reply saved? (checked 2026-10-17)](/framework/audio/Whisper/doc/raw-log.md) — Update 2026-10-20: Dictate now writes every reply to the WhisperLog bucket instead of Servex's whisper-raw log, so the [Whisper page](/fram…
- [System architecture — a checkable container per module, one…](/framework/ext/System/doc/architecture.md) — A System is anything we keep in order: its files (root), its readme, its rules, and a check() that computes whether they hold. The base cla…
- [Ask architecture — one turn is one fresh process, bound to …](/framework/ext/Ask/doc/architecture.md) — Ask lets the browser talk to a Claude Code session on the dev server. The browser calls ask(), thread(), start() or chat() in [Ask.js](/fra…
- [Pace, not percentage](/framework/ai/AITask/doc/pace.md) — usage.js's usage_rail(u) renders usage.json's utilization.limits[] as meters. Each usage window is a fixed length (LENGTH.session = 5h, LEN…
- [Context loss: a session's work survives only in files](/framework/ai/doc/context-loss.md) — When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows onl…
- [A per-module log view (a note, not built)](/framework/ai/doc/module-log-view.md) — The owner's idea (2026-10-24, item 8 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): every m…
- [Past work via a Haiku child session: a reusable search with…](/framework/ai/doc/past-work-haiku.md) — The owner's ask (2026-10-24, item 5 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): finding …
- [Prompt audit: what the owner asked in a session, and what c…](/framework/ai/doc/prompt-audit.md) — The owner asks for many things in each long prompt, and some are never done. The prompt audit finds them in two passes. Pass 1: Haiku reads…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-09-30 Logs: unknown verbs on AI 2; the validator checks the schema; register experiment and rev… (mastermind-servex (10 PM task, item 12), queued)
- 2026-10-18 Logs: unknown verbs on AI 2; the validator checks the schema; register experiment and rev… (?, tracked)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,563 tokens of reading, under the 100k limit).

Question: Session identity: per-session turns and the identity check

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session identity: per-session turns and the identity check"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
