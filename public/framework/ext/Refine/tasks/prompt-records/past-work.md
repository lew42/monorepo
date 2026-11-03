<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Prompts as records  every owner prompt broken down  tracked and completed" (words: prompt, record, every, owner, broken, down, tracked, completed)

## Tasks (8, best first)
- 2026-10-22 [Prompt audit: Haiku sorts each owner prompt, Sonnet finds each sessio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-audit-system/) — The prompt audit runs: one command per session, results beside the session, nothing filed as tasks. [How to run it, cost](/framework/ai/doc/prompt-audit.md) both passes on session 7efd07d5: 22 prompts, 376 items, $2.01; two reviewer rounds with feedback recor… · paths 1/1 exist
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-13 [Asks to tasks: 22 asks from requirements-14 to -17 are tracked](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/asks-to-tasks/) — 22 of the owner's asks are now real tasks in their module homes, and 17 are already complete. Each links its requirements file and ask number in source and carries a note of which agent took it. See [/tasks/](/tasks/). ai (10), core/Task (4), ux/Dictate (7), …
- 2026-10-13 [Asks tally: 859 asks, 309 features, what landed and what never did](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/) — [Your asks, tallied](/framework/ai/doc/asks-outcomes.md): 859 asks in 1,990 of your prompts since 09-15, grouped into 309 features. 101 done, 118 partly, 90 with no evidence. Asked most, not finished: 1. session system: 47 asks, partly 2. task system: 33, par…
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-13 [Deploy cap: 17,058 files down to 7,976; 2,714 pictures (342 MB) untra…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/deploy-cap/) — public/.assetsignore keeps the deploy at 7,976 of 20,000 files, and 2,714 tracked screenshots left the index (files stay on disk; one commit undoes it). Merged 50cbf6911 (untrack 9cc753185, assetsignore + scripts bf34ebfc5). Checkout 583 → 241 MB. Left: merge…
- 2026-10-13 [Session data: owner prompts are duplicated (8 MB in git, ~185 MB loca…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-dup-check/) — Yes, our logs duplicate the owner's prompts: 8.05 MB in git and about 185 MB on disk also live in the SDK session files. The words and voice test logs are now ignored, the council and crawl writers go to the store, and the two stray folders were moved by scri…

## Modules that exist now (files outside the module that import it)
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 5 files
- [ext/markdown](/framework/ext/markdown/) — used by 55 files

## Docs and readmes
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Quotation — one owner prompt: words, time, how, and a link](/framework/ux/Content/Quotation/readme.md) — A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: prompt — [shapes](/framework/ux/Conten…
- [Prompt audit: what the owner asked in a session, and what c…](/framework/ai/doc/prompt-audit.md) — The owner asks for many things in each long prompt, and some are never done. The prompt audit finds them in two passes. Pass 1: Haiku reads…
- [Every page has an md/ — its markdown files, as pages](/framework/core/Page/doc/markdown.md) — Add md/ to any page's url and you get that folder's markdown, rendered. Nothing to write: it is built into Page, so every module has it. | …
- [Dropdown architecture — a trigger that shows its choice, an…](/framework/ext/Dropdown/doc/architecture.md) — Dropdown is one choice out of a short list: a button that shows the current option's picture and name, and a [popover] list that opens abov…
- [Prompt — one prompt, seen at every step of its refinement](/framework/ext/Refine/doc/prompt.md) — Prompt (ext/Refine/Prompt.js) is the class the owner asked for in [the vision](vision-2026-10-08.md): one object per prompt that holds what…
- [Prompt refinement — the owner's design, dictated 2026-10-08](/framework/ext/Refine/doc/vision-2026-10-08.md) — Recorded so the intent survives chat. Nothing here is built as written; check each stage against Refine.js, engine.js, structure.js and the…
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…

## Sessions tagged with these words
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)
- 2026-10-13 Prompts: each owner prompt becomes a refined Inbox card (?, dropped)

## Commits
- 8185592d0 docs(Refine): card types + task lifecycle, owner's vocabulary dictated 2026-10-16
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- 1c6b89989 Sessions: no duplicate transcripts, date-path seam, Start/Stop/Duration
- 73147e319 recursive-pairs fix2: second review's findings — tools, id validation, posture, docs
- d20996944 Servex pairs: one root assistant, landings reach it, recorded parents in policy, one assistant text (recursiv…
- 8d499717b Mobile bottom rail: ✦ AI listening sheet, ☰ reaches the drawer's tabs
- d843620ef AI 2 on card folders: every card is a Card page built from its page.jsonl; sub-cards, type picker, prompt rec…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: Prompts as records: every owner prompt broken down, tracked and completed

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Prompts as records: every owner prompt broken down, tracked and completed"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
