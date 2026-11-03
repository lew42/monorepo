<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Every VS Code tab s session folder gets session jsonl" (words: every, code, tab, session, folder, get, jsonl)

## Tasks (8, best first)
- 2026-10-20 [Every VS Code tab's session folder gets session.jsonl](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/requirements.md
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-12 [Page inbox: an Inbox tab on every page](/framework/ai/sessions/2026/10/12/session-87bec773/page-inbox/) — Every page has an inbox, unread first, archive to zero. [Doc](/framework/core/Page/doc/inbox-tab.md) opt-out on Page: Inbox tab on Doc pages (DataGrid), inbox/ route + unread chip on Page and Sessions appended deltas in page.jsonl, streamed live; Archive/read…
- 2026-10-04 [Sessions: VS Code tab cost was silently stalling after midnight](/framework/ai/sessions/2026/10/04/vscode-session-cost/vscode-session-cost/) — Found the real bug and fixed it: a VS Code tab's cost stopped updating once its page passed midnight. Session 60d9def6 (this mastermind's own tab) was stuck at $29.12; its real transcript already priced at $110.07. VS Code cost from its own transcript, no tim…
- 2026-09-29 [Every page.jsonl now lists its own folder, not just hand-made pages](/framework/ai/sessions/2026/09/29/page-files-log/page-files-log/writer/) — Every covered folder gets its own page.jsonl — 2,870 now, up from 464. one rule (covers()) picks which folders page.js folders included too — [imagine/cms/json/](/imagine/cms/json/) still renders a new folder gets its log right away (proved: create, delete, 5… · paths 1/1 exist
- 2026-10-20 [A spawned agent's folder starts as session.jsonl (slice 3)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/requirements.md

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 10 files
- [ext/JSONL](/framework/ext/JSONL/) — used by 45 files
- [ext/Session](/framework/ext/Session/) — used by 9 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/table](/framework/ui/table/) — used by 9 files

## Docs and readmes
- [Every prompt kept in its session's log (2026-10-10)](/framework/ext/Refine/doc/session-log-2026-10-10.md) — What: a prompt refined on the Refine page is saved in the session's own folder, in prompts.jsonl, in stages. Nothing is ever overwritten. |…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [Page — a folder with a page.js or a page.jsonl is a page: a…](/framework/core/Page/readme.md) — class Page extends Item (Page.class.js, the 23 small files beside it are its parts, listed in [doc/classes.md](doc/classes.md)). A page is …
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex (proposal-flow, 10 PM), queued)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 212a16848 Markdown Explorer: /<module>/md/ is a Browse (readme in the pane, every .md listed), plus the md tab
- 9c7d12d75 One New session button; one MicIndicator on every mic surface
- 77f999143 Page inbox tab: every Doc page gets an Inbox tab, every page an inbox/ route; unread first, archive via note_…
- 987016773 ai: rename the CLAUDE.md copy to CLAUDE.copy.md so Claude Code stops loading it as a second, older rulebook
- d13bdc643 Servex: spawn_agent defaults parent to the caller (ctx.caller), per the owner's parent/child requirement
- 6ee3c6aa9 sessions: fix the VS Code cost undercount and show the per-1% inputs
- 1c6b89989 Sessions: no duplicate transcripts, date-path seam, Start/Stop/Duration
- 9a1dd4874 session-cost: per-prompt Claude $ reader, Stop-hook append, week-cost snapshot

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,216 tokens of reading, under the 100k limit).

Question: Every VS Code tab's session folder gets session.jsonl

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Every VS Code tab's session folder gets session.jsonl"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
