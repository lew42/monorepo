<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build the session switcher in the dictate widget  also the mobile sheet  in a worktree  reviewed  landed via node Serve" (words: build, session, switcher, dictate, widget, also, mobile, sheet, worktree, reviewed, landed, via, node, serve)

## Tasks (8, best first)
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — (no outcome logged)
- 2026-10-12 [Sessions: rows come from a node query, not every file](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/) — Sessions now asks node for the rows it shows — default on the dev socket; ?source=files keeps the old path. node holds the data, socket query API: [ext/Query](/framework/ext/Query/), 30–40 ms per query client gets only what it shows: heap 33 → 17 MB, socket 9… · paths 1/1 exist
- 2026-10-04 [Land sessions-tab-polish + data-grid: dead worktree servers, one real…](/framework/ai/sessions/2026/10/04/land-two-branches/land-two-branches/) — Both branches landed on michael/dev. sessions-tab-polish (8824068f), data-grid (ac28ba1e). Reviewed: size none, pass — both features were already built and reviewed twice by their own task masterminds; this task's job was landing them. land sessions-tab-polis… · paths 1/1 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-17 [Worktrees: a plan-first script removed 6 landed worktrees, kept 23](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/) — node Server/Worktrees.mjs --plan lists the 30 non-pool worktrees with a verdict. --apply removed the 6 whose work is on michael/dev (2 forced over regenerated files only) and left 23 alone: 3 with unmerged commits and 19 with real uncommitted files. No branch…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 16 files
- [ext/Session](/framework/ext/Session/) — used by 12 files
- [ux/Dictate](/framework/ux/Dictate/) — used by 34 files

## Docs and readmes
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Owner notes, 2026-10-16 (night): the mobile sheet, the draw…](/framework/ext/drawer/doc/owner-2026-10-16-sheet.md) — A big surgery. A mastermind manages it, a worktree tests it, and the owner approves each step before it is built. Slow and methodical; mock…
- [Widget — the one dictation widget, configured](/framework/ux/Dictate/doc/widget.md) — Widget.js is the ✦ sheet's own compact widget (a framed card: bubbles on top, a composer row — typed box, mic, Send — at the bottom) pulled…
- [Past work via a Haiku child session: a reusable search with…](/framework/ai/doc/past-work-haiku.md) — The owner's ask (2026-10-24, item 5 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): finding …
- [Widget notes](/framework/ux/Dictate/doc/widget-notes.md) — Comments pruned out of Widget.js (2026-10-12); the code keeps a one-line pointer to each heading. Original wording, nothing lost. ## Model …
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/15 [Past-work log node script](/framework/ai/sessions/2026/10/15/session-d76f0d2e/) — kind/owner model/sonnet mod/server mod/ai/sessions task/past-work-log · $1.06
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-03 Now card: grouped by system (AI, Page, Servex), landed + working, with references (vscode-mastermind, done)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)

## Commits
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Build the session switcher in the dictate widget (also the mobile sheet), in a worktree, reviewed, landed via node Serve

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build the session switcher in the dictate widget (also the mobile sheet), in a worktree, reviewed, landed via node Serve"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
