# Checkup: Servex (the compaction nudge, the cost helper, the voice sessions' loose ends, the expensive dormant agents)

Budget: $10. Sonnet. Read `../checkup-common.md` first: it is the job description for every checkup; this file holds only what is specific. `V` is the path named there.

## The tasks

Module: `Servex/` (`readme.md`, `agents/readme.md`, `doc/`, `agents/doc/owner-2026-10-16-*.md`, `Servex/doc/owner-2026-10-16-tools.md`).

1. **`V/compact-nudge/`** (`helper-compact-nudge`, Sonnet, $24; `roles.js` e0a0b1ead; `review.md` + `review.jsonl` untracked): an idle-time compaction nudge replacing the auto /compact. Verify the code is on dev and reviewed; commit the records; it needs a Servex restart to apply: write the `needs_restart` log line. Close the task or say what is missing.
2. **`helper-cost-fix`** (idle): its work landed (a392e2049). If nothing is open for it, `stop_agent` with a one-line reason logged.
3. **The two expensive dormant agents:** `mastermind-voice-opus` ($694, context 6k after a resume) and `mastermind-task-system` ($272, context 60k). Decide: leave dormant (costs nothing until woken; a wake reloads the context) or stop (a future reader resumes by session id anyway). Record the decision and the rule for the mastermind skill as a should ("an agent past $X is read, not woken").
4. **The handover's loose ends nobody owns** (section "2026-10-17 00:30", items 1, 3, 5, 9): (1) a per-prompt hook so every Claude-app prompt lands timestamped in the session log: is `append_prompt_event` / `log_session` already the door? Answer with the code, and if a two-line change closes it, do it; (3) a `skill` MCP tool that returns a skill's text for connectors (tools only, no MCP prompts): build it if under 30 minutes (one tool in the `Servex/agents/tools.js` family, tested with curl on a private port), else a brief; (5) the coordination rule (propose before building, the other agrees or improves, never edit in the other's directory) into `.claude/skills/mastermind/SKILL.md` as a should, one short paragraph, with one line in its `improvements.md` noting the source; (9) a `home` path at spawn so sessions and tasks are tagged by module up front: decide (a `task.home` field written into line 1 by `spawn_agent`) and do the small version or brief it.
5. **Stray path:** `public/framework/ai/ai/v-bn4knay.jsonl` (a page-assistant session wrote a doubled `ai/`; in `ai/todo.md`). Find the writer, fix the path once, move the file by script (`git mv` after adding it, a manifest line in the todo entry), commit.
6. **Follow.js** (handover item 8: browser events such as navigation and clicks are not relayed to the agent queue): one line in `ai/todo.md` with the link, unless it is already there.

Fence: `Servex/**`, `.claude/skills/mastermind/` (the one paragraph + improvements line), `ai/todo.md`, the stray file's move, the records named, this task dir. Never restart Servex; never change `policy.js` fences (the owner's grant stands).
