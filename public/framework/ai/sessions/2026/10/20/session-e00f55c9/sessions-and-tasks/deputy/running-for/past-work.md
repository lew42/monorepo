<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Sessions  real span and active time  the VS Code tab row recognisable" (words: session, real, span, active, time, code, tab, row, recognisable)

## Tasks (8, best first)
- 2026-10-20 [Sessions: real span and active time; the VS Code tab row recognisable](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/running-for/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/running-for/requirements.md
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-09 [Sessions: red flags, roles and stable In-flight](/framework/ai/sessions/2026/10/09/session-1c89ffc4/sessions-red-flags/) — Sessions now flag expense and stalls, and (unknown) is small. negative durations gone: resumed agents kept an old stop time; now clamped (AISessionRows.span_ms) (unknown) role: 7,270 sessions down to about 427, classified from source, Servex registry and firs…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-04 [Land sessions-tab-polish + data-grid: dead worktree servers, one real…](/framework/ai/sessions/2026/10/04/land-two-branches/land-two-branches/) — Both branches landed on michael/dev. sessions-tab-polish (8824068f), data-grid (ac28ba1e). Reviewed: size none, pass — both features were already built and reviewed twice by their own task masterminds; this task's job was landing them. land sessions-tab-polis… · paths 1/1 exist
- 2026-10-04 [Sessions: VS Code tab cost was silently stalling after midnight](/framework/ai/sessions/2026/10/04/vscode-session-cost/vscode-session-cost/) — Found the real bug and fixed it: a VS Code tab's cost stopped updating once its page passed midnight. Session 60d9def6 (this mastermind's own tab) was stuck at $29.12; its real transcript already priced at $110.07. VS Code cost from its own transcript, no tim…
- 2026-10-24 [Session report: real cost, child sessions, year and month lists](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-report/) — The Report tab of a session's dated folder shows its real cost, its child sessions and its counts; the year and month pages list sessions (0fe5bc9b6). report tab wired to the item tool: the cost is the item tool's total, the same number the session page's sta…
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 14 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/row](/framework/ui/row/) — used by 7 files
- [ui/table](/framework/ui/table/) — used by 9 files

## Docs and readmes
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Ask — talk to a Claude Code session from the browser; for p…](/framework/ext/Ask/readme.md) — ## Use js import { ask, available } from "/framework/ext/Ask/Ask.js"; if (available()) { const { text } = await ask("Name the three widest …
- [Draggable — grab-and-move for any View; Sortable reorders, …](/framework/ext/Draggable/readme.md) — ## Use js import Sortable from "/framework/ext/Draggable/Sortable.js"; class Card extends Sortable { drop_check(target){ return target !== …
- [Session architecture — the browser is a thin client, Servex…](/framework/ext/Session/doc/architecture.md) — ext/Session is the browser half of a voice session: one ✦ press is one session, and its whole conversation is one JSONL file that Servex wr…
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Proposal: notes on tasks, and a session log that replays as…](/framework/ai/doc/task-notes-proposal.md) — Status: proposal, not built (the owner asked to see it first, 2026-10-24, item 17 of [the brief](../sessions/2026/10/20/session-e00f55c9/se…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, routed)
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, landed)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)

## Commits
- 492387499 ai/sessions: cost-over-time chart + "what was it doing" waste table

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,563 tokens of reading, under the 100k limit).

Question: Sessions: real span and active time; the VS Code tab row recognisable

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Sessions: real span and active time; the VS Code tab row recognisable"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
