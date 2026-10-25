<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session detail page  the Overview  grouped by prompt  step 2a " (words: session, detail, overview, grouped, prompt, step)

## Tasks (8, best first)
- 2026-10-22 [Prompt audit: Haiku sorts each owner prompt, Sonnet finds each sessio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-audit-system/) — The prompt audit runs: one command per session, results beside the session, nothing filed as tasks. [How to run it, cost](/framework/ai/doc/prompt-audit.md) both passes on session 7efd07d5: 22 prompts, 376 items, $2.01; two reviewer rounds with feedback recor… · paths 1/1 exist
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-13 [Session data: owner prompts are duplicated (8 MB in git, ~185 MB loca…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-dup-check/) — Yes, our logs duplicate the owner's prompts: 8.05 MB in git and about 185 MB on disk also live in the SDK session files. The words and voice test logs are now ignored, the council and crawl writers go to the store, and the two stray folders were moved by scri…
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-24 [queue-top: five session-detail fixes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/queue-top/) — 3 already done (back link, repeated ID line, indexing test passes), 1 not reproducible (load error), 1 fixed: 'All sessions' labels renamed to 'Sessions'. Merge e6e1f26f6.
- 2026-10-19 [Owner's asks (from voice session v-g6wux1j, page /framework/ai/sessio…](/framework/ai/sessions/2026/10/19/spawned/task-mastermind-session-detail-page/) — (no outcome logged)
- 2026-10-16 [Session extends Item: step 7 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/session-item/) — Landed on michael/dev as 6858167bc.
- 2026-10-13 [Asks tally: 859 asks, 309 features, what landed and what never did](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/) — [Your asks, tallied](/framework/ai/doc/asks-outcomes.md): 859 asks in 1,990 of your prompts since 09-15, grouped into 309 features. 101 done, 118 partly, 90 with no evidence. Asked most, not finished: 1. session system: 47 asks, partly 2. task system: 33, par…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 14 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [Prompt audit: what the owner asked in a session, and what c…](/framework/ai/doc/prompt-audit.md) — The owner asks for many things in each long prompt, and some are never done. The prompt audit finds them in two passes. Pass 1: Haiku reads…
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as an open task (idle, waiting…
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Every prompt kept in its session's log (2026-10-10)](/framework/ext/Refine/doc/session-log-2026-10-10.md) — What: a prompt refined on the Refine page is saved in the session's own folder, in prompts.jsonl, in stages. Nothing is ever overwritten. |…
- [Prompt — one prompt, seen at every step of its refinement](/framework/ext/Refine/doc/prompt.md) — Prompt (ext/Refine/Prompt.js) is the class the owner asked for in [the vision](vision-2026-10-08.md): one object per prompt that holds what…
- [Task lifecycle: one design for prompt to landed change (pro…](/framework/ai/doc/task-lifecycle.md) — See also: the seven-step shape of a bigger task (requirements and plan, a minion builds, a fresh reviewer, merge, land) is in the [mastermi…
- [day-prompts.js notes](/framework/ai/AITask/doc/day-prompts-notes.md) — ## WHERE THE WORDS LIVE Every owner prompt is one Prompt item on its own session page — /framework/ai/<Y>/<M>/<D>/session-<id>/page.jsonl (…
- [Roles, processes, skills and sessions: how one becomes a sp…](/framework/ai/doc/role-process-skill-session.md) — The owner's questions (2026-10-24, items 12 and 13 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-10-03 Now card: grouped by system (AI, Page, Servex), landed + working, with references (vscode-mastermind, done)

## Commits
- 626987a16 ai: sessions brief, detail page overview ranked by cost + recency, grouped prompt->task->subtask, green check…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,755 tokens of reading, under the 100k limit).

Question: Session detail page: the Overview, grouped by prompt (step 2a)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session detail page: the Overview, grouped by prompt (step 2a)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
