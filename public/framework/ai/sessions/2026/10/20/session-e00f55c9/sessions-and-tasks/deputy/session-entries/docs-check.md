# Docs check: core/Session and core/Task readmes, "Session entries"

Read only the two worktree readmes, no code. Verdict: mostly yes — a newcomer could answer all five questions, but two spots need tightening.

## The five questions, answered from the readmes alone

1. **Shape on disk** — yes, exact: `{"<cause id>": {"task": "<child folder url>", "type": "Session", "spawn": {role, model, effort, role_readme, brief, session_id, agent, at, placed}}, "by": "Servex", "ts": …}` (Session readme, "Session entries").
2. **Who writes it, from where** — yes, a clear chain: `SessionRecord.add_ref`/`entry_line` (`Server/SessionRecord.mjs`), called by `link_parent` and `ChildLinks.link`, both called from `open_task` (`Servex/agents/Agents.js`).
3. **Which class reads it** — yes, one name: `Task.from_ref(ref, as, entry)` in `core/Task/Task.js`, confirmed on both sides (Task readme line 59, Session readme "The reader" bullet).
4. **How the parent's cost is computed** — yes but dense: `own` (this folder's agents), `children` (sum of each entry's total, recursive), `total` = own + children, computed in `session_state` (`page_tools.js`). A newcomer could follow it, but only after re-reading twice.
5. **How to run the backfill** — yes, exact command: `node Server/ChildLinks.mjs --entries [--names <id>] [--root <repo>] [--list] [--apply]`, dry-run default, manifest at `sessions/session-entries.jsonl`.

## Unclear or incomplete

- The backfill's own numbers say "25 plain task folders that should have been lines… It plans every folder… it also prints item 33's check: the folders that are neither a session nor a project" — but neither readme says what `--apply` actually does with those 25 folders. A reader could assume `--apply` fixes everything it lists; it only acts on `upgrade`/`add`, not on misplaced plain folders. Worth one added clause: "it does not move or fix the 25 plain folders, only lists them."
- The cause rule's case (b) is jargon without a definition in this doc: *"a handoff (`task: {from, id}`): the subtask itself is upgraded in place, and `move_item` leaves `{"task", "as": <its id>, "type": "Session", "spawn"}`"* (Session readme, "The cause" bullet). A newcomer hasn't met "handoff" or `move_item` yet at this point in either readme — it reads as an internal note, not an explanation.

## Not checked

No code was read (per the brief), so I can't confirm the readme text matches the current implementation — only that the prose itself is internally consistent and answers the five questions. The two readmes do not contradict each other anywhere I found; the "25 plain folders / 0 projects / 95 upgrades" numbers match exactly between both files.
