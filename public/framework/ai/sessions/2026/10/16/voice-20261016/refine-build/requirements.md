# ext/Refine + ux/Dictate: build the redesign and work the two inboxes

Asked by the owner by voice on 2026-10-16 (question 912a73f8), relayed by mastermind-voice-20261016. You are a task mastermind (load `sub-mastermind`). Sonnet, high effort, $20 cap. Spawn minions only if they save money; commit each working step.

## Start here
- The Oct 15 audit: `public/framework/ai/sessions/2026/10/15/voice-20261015/refine-audit/` (requirements.md, review/report.md), and its redesign proposal `public/framework/ext/Refine/doc/redesign.md` (proposed, not built). Build the redesign's smallest slice first.
- The inboxes: `public/framework/ext/Refine/inbox.jsonl` (46 notes) and `public/framework/ux/Dictate/inbox.jsonl` (20 notes). Each note has an `essence` and a `source` link to the owner's words. Work them newest first.

## The owner's four named asks, in priority order
1. Cleaned sentences go INTO the existing structure, not a wall of text, so every sentence stays tracked.
2. Real-time, incremental refinement: refine step by step as the owner speaks.
3. Send each finished sentence off (out of the text area) while the next one is still being transcribed.
4. Fix the broken web voice dictation page, as part of the Refine/chat system, not as a standalone patch.

## Rules
- Read the readme chain first; reuse what exists (Cleaner, engine.js, Dictate); one of everything.
- Work in a worktree; check_page at 400/1200/1920/3440 before merging; merge into michael/dev when a step works.
- Mark each inbox note you resolve (append a line, never delete).
- Never drive the owner's browser tabs (headless only). Never restart Servex. Never write the owner's name.
- Post a log line at least every ~5 minutes.

## Report
When done (or the budget runs out), finish-task, then message mastermind-voice-20261016 with one screen: what works now (with links), which of the four asks are done, the inbox notes resolved and left, and the next slice.
