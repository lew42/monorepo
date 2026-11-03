verdict: fix
1. [fix] The daily respawn will probably never fire for the real architect. `held()` treats any `state === "stopped"` as "stopped on purpose" (Servex/agents/Respawn.js:101), but the Lifecycle reaper stops idle agents whose task has landed with no `by` (Servex/Lifecycle.js:277, 310). The process-system task already reads `complete` (process.md Status), and `mastermind-system-architect` is not in the reaper's standing-agent list (Lifecycle.js:245). So after a quiet day the architect is reaped, and Respawn then skips it forever. Fix: test `row.stopped_by` alone (a reaped row has none), or add the id to the reaper's exemption list, and add a test for "reaped idle, a day old → respawned".
2. [fix] Requirement 2 says "completion is automatic", but process.md:143 records a known break: a landed task that gets new open children still reads `complete`. This diff now makes that case common, because requests add tasks to other agents' task logs (page_tools.js:225–249). A request added to a landed task stays invisible to completion. Adding an open child to a complete task should reopen it, in Task's replay, with a test.
3. [note] Most of this diff is outside requirements.md: the session menu and settings, Respawn, requests as logged items, the `design` process, the one-stream design and the docs-vs-logs rule. Each follows a later owner dictation. The brief's own deliverables (Process, ProcessRunner, process.md, run 1, the "document per prompt" rule in mastermind.md:20) landed in earlier commits (b8d7e49f9, 60808be61). Splitting this into separate branches would make each merge easier to judge.
4. [note] The session menu changes a page (core/Page/Columns.js:48, Page.css:661, AISessionDetail.js:116), but no shot shows it. The only shots in this folder are the 404s from the earlier review (review/report.md finding 1). The button, its popover and `/settings/` need one shot each at 400 and 1200 from a served worktree before the merge.
5. [note] Respawn's list is a hard-coded static holding one dated folder path (Respawn.js:74–78). A simpler way: a `fresh_daily: true` flag on the spawn spec or registry row, read by the tick. Then the next standing agent needs no code edit, and the path is not copied into a second place.
6. [note] SessionSettings saves model, effort and notify, but nothing reads them yet (core/Session/doc/menu.md, "Not built yet"). This is stated honestly. Still, an owner who sets "Model: Opus" today gets no effect and no warning on the form. Add one line on the Settings page saying so.
7. [note] Any caller that is not the log's own agent counts as an asker (page_tools.js:225), including `owner` from the browser and a parent adding steps to its minion's task. Each of those adds now sends the receiver a chat notice. That is probably intended, but messaging.md:164 should say that parent-to-child adds count too.
8. [note] The `hooks` line in page_tools.js:642 now holds two trailing `//` comments one after the other, and the second one is cut off from its key. Put each comment on its own key.

## Requirements
- 1 "Study first … fix the readme in place" — yes — earlier commits 60808be61, da6a2a35d; this diff adds lifecycle.md, messaging.md, one-stream.md, rules.md sections
- 2 "Process extends Task … build and investigate" — yes — Process.DEFINITIONS (Process.js), plus the `design` process added at Process.js:100
- 2 "Node runs it" — yes — ProcessRunner, wired in Servex.js:285; Respawn is added to the same tick (TaskLoop.js:89)
- 2 "Completion is automatic" — no — process.md:143, a landed task given new children stays complete (finding 2)
- 2 "A session is queryable … where the item tool writes raw deltas, where the server instantiates" — yes — one-stream.md, "The design", points 1–2
- 2 "Robust data from tools" — yes — respawn and request lines are written by tools (Respawn.js:126, page_tools.js:234)
- 2 "Async without dropped balls" — yes, partly — requests answer through a logged item (messaging.md:157); a reaped architect is a dropped ball (finding 1)
- 2 "Process quality from data" — n/a in this diff
- 3 "First slice … one real task run through it, with what broke" — yes — run-1/ and process.md (commit b8d7e49f9)
- Also "Documentation per prompt … in the mastermind role readme" — yes — Servex/agents/roles/mastermind.md:20
- Also "Plan the prompt-audit asks, do not do it yet" — yes — process.md Status, "Next"
## Words
- content 1 (plain, full sentences) — yes — lifecycle.md:140–148 and messaging.md:157–166 read as plain steps
- content 2 (one takeaway) — yes — one-stream.md opens with its status and its aim
- content 3 (no jargon left undefined) — yes, mostly — "envelope" and "replay rule" are explained in context
- content 4 (no duplicate notes) — yes — owner-2026-10-21-items-hold-items.md links the new answer, so it is not a second copy
