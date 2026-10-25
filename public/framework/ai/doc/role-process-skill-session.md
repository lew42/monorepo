# Roles, processes, skills and sessions: how one becomes a spawned session

The owner's questions (2026-10-24, items 12 and 13 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): can the item tool already add a process to a session and spawn an agent from it, and how does a role or a process become a session with its model, effort, system prompt, readmes and skills? One recommendation at the end.

## The item tool already does it (no new MCP tool)

Checked in the code, 2026-10-24.

1. **Add a process to a session:** `item({path: <session>, delta: {tasks: {add: {title, process: "build", brief}}}})`. `page_tools.js` (`process_home`, `make_process`, around line 990) sees `process` (a template name) or `steps` (your own list), makes the folder, writes line 1 and one add line per step, and notes it in the session.
2. **Spawn an agent from it:** the same call tells `ProcessRunner` (`Servex/ProcessRunner.js`, `launch()`), which calls `agents.spawn({role, model, effort, prompt, task})` for each step whose `session.run` is `fresh`, then moves on when the step's agent completes it with another item call. `same` re-uses the previous step's agent; `owner` hands the step to the process's creator.
3. **A one-off agent is a one-step process:** `steps: [{title, do, session: {run: "fresh", role, model, effort}}]`. `Process.from_steps` already accepts it.

So the target in item 12 is met. **The gaps are inside the spawn, not a missing tool:** below.

## What makes a session today

| Part | Comes from | Where |
|---|---|---|
| model, effort, permission | the role's row, then the caller wins | `roles.js` row (`tier` → model in `tiers.js`); a process step's `session: {model, effort}` is the caller |
| the role text (the system prompt) | the row's `readme:` (`Servex/agents/roles/<name>.md`) plus the row's `skills:` (`.claude/skills/<name>/SKILL.md`), inlined into the system prompt so it survives compaction | `role_system()` in `roles.js` |
| the readme chain | the readmes from the repo root down to the task or page folder, prepended to the first message | `Agents.spawn` (README CHAIN) |
| the brief and the first prompt | `task: {dir, brief}`; a process step builds its prompt from the step's `do` and the earlier steps' outcomes | `Process.prompt()` |

## Three gaps

1. **`helper` is not a role.** The build, design and investigate templates give most steps `role: "helper"`, and `ProcessRunner` defaults to it, but `roles.js` has no `helper` row (`canonical("helper")` is `undefined`). Those steps get the step's model and effort and **no role readme and no skills**. Only the `reviewer` steps get role text.
2. **A step cannot name skills.** Skills come only from the role's row, so a "Haiku scout that does past-work" needs its own role row.
3. **A minion that only reads can't spawn when the pool is dry** (the main-tree guard in `Agents.spawn`): [past-work-haiku.md](past-work-haiku.md).

## The recommendation: four roles, and a step = role + overrides + skills

**Keep the roles at four** that do work: `minion` (a Haiku that reads, scans, searches; the `worker` part of a skill), `task-mastermind` (does one task, Sonnet), `mastermind` (a standing architect; `ai-system-mastermind`, `core-page-mastermind` and the other subject masterminds are this role with a different readme, not new kinds) and `reviewer`. The voice and card assistants stay as they are. A new job is **not a new role**: it is an existing role plus a skill (and, for a process step, a model and effort).

A spawned session is then four things, each named in one place:

```
role        which readme + posture          roles.js row (tier → model/effort/permission)
model/effort  only to change the role's default   the step's session:{model, effort}
skills      the way to do this job          the role's row, and the step's session:{skills:[...]}  (name or name/part)
brief       what to do now                  task:{dir, brief} + the step's `do`
```

Skills are our own readmes ([skills/readme.md](../skills/readme.md)): `skills: ["past-work/worker"]` means `ai/skills/past-work/readme.md` plus `worker.md`.

### Four small changes (one task, reviewed, then a Servex restart)

1. `roles.js`: make `helper` an **alias of `task-mastermind`** (so the old process logs still replay, and every step gets a role readme). The scout steps (`model: HAIKU`) become `role: "minion"`.
2. `roles.js` `skill_text()`: accept `name/part`, read `public/framework/ai/skills/<name>/readme.md` + `<part>.md` first, else `.claude/skills/<name>/SKILL.md` as now. About 10 lines.
3. `Agents.spawn` and `ProcessRunner.launch`: pass `skills` from the step to the spawn, appended to the role's own. About 10 lines.
4. A `read_only: true` spawn flag for searches ([past-work-haiku.md](past-work-haiku.md)), reviewed on its own since a mistake there puts a minion in the main tree.

Alternative considered: one role per job (`searcher`, `scout`, `auditor`): rejected. It multiplies readmes, and the difference between a scout and a searcher is the skill, which a plain `minion` + skill carries.

Until these land, the workaround is the one already in use: the mastermind pastes the worker part into the child's brief ([skills/past-work/mastermind.md](../skills/past-work/mastermind.md)).

## Open option (the owner, 2026-10-24, note only, no build): the VS Code tab as a voice agent

The owner is weighing splitting the VS Code tab into a lighter **voice agent** that forwards each prompt to an **SDK mastermind** (a Servex agent) which does the work.

- **For:** all agents on one system (one set of logs, tasks and costs); local tools run in-process; dictation from the phone works (the cloud voice agent already shows the shape).
- **Against:** two contexts (the voice tab does not know what the mastermind was asked unless every hand-off is logged); the roles must be coordinated (a strict forwarder that only monitors risks losing the thread); the prompt is passed off automatically, so the splitter's task becomes the only record.
- **Not decided.** Effort and model matter less than the hand-off being automatic. If taken up, start from the [tab relays to a deputy](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-breakdown/plan.md) routine already in use, which is this split with the tab still doing the forwarding. Source: the prompt `76cbf230…` in `ai/sessions/2026/10/20/session-e00f55c9/prompts.jsonl`, S23–48.

## Idea (the owner, 2026-10-24, not now): roles per folder

Any folder can be an AI system: its readme, plus optional role files that only that role loads (a `mastermind.md` beside the module's readme, or `framework/ai/system.md` for the AI system mastermind: its own role, abilities and operating procedure). A spawn would read the readme chain as now, then the role file in each folder on the way down if one exists for its role. Not built; source: agent-base item 10 (`ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-base/requirements.md`).
