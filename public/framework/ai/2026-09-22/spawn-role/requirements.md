# spawn-role — an agent's posture comes from its role, and a registry says who is alive

Minion: Sonnet, effort high. Session id `d9bde1af-3e17-4405-ac65-1a59c4f10a43`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then phase-2 items
**3** and **4** in [`../tiers-design/doc/phases.md`](../tiers-design/doc/phases.md) and the
roles in [`../tiers-design/doc/roles.md`](../tiers-design/doc/roles.md). Load the `code` skill.

## What exists

Servex is RUNNING under its keeper (`node Servex/sustain.mjs --status`; keeper pid 28488,
Servex pid 14808 as of 15:47). `Servex/agents/Agents.js` — `spawn({role, name, prompt, model,
effort, cwd, visibility, permission_mode, allowed_tools})`; `Servex/agents/tools.js` — the five
MCP tools; `Servex/readme.md` and `Servex/agents/readme.md` are accurate. The skills that define
a posture: `.claude/skills/{minion,sub-mastermind,mastermind,every-prompt,master-assistant,
log-assistant}/SKILL.md`. `node .claude/skills/every-prompt/say.mjs state` prints the run
state the fast assistant reads; today it routes off one `mastermind_session` field.

⚠ Servex is live: after editing `Servex/**`, restart it with `node Servex/sustain.mjs --stop`
then the hidden launch (`powershell -NoProfile -Command "Start-Process -FilePath node
-ArgumentList 'Servex/sustain.mjs' -WorkingDirectory 'C:\Code\lew42\monorepo' -WindowStyle
Hidden"`), confirm 8090 answers, and log the new PIDs. Never `cmd /c start`.

## Deliverables

1. **`spawn_agent({role})` loads that role's skill before the agent's first turn.** The
   mapping role → skill lives in one small table in `Servex/agents/roles.js` (`minion` →
   `minion`, `task-mastermind` → `sub-mastermind`, `mastermind` → `mastermind`, `assistant` →
   `every-prompt`, `master-assistant`, `log-assistant`), with the model, effort, permission
   mode and allowed tools each role gets by default (take them from `roles.md`; a caller may
   override). Loading = the first user message is "Load the `<skill>` skill, then: <prompt>"
   or the SDK's own skill/system-prompt option if one exists in 0.3.280 — read the `.d.ts`,
   log which. Prove: spawn a `minion` whose prompt says NOTHING about fences, give it a brief
   in your task dir that names a one-file fence, and watch it respect it (its transcript
   events show it loaded the skill and its file_touch events stay inside the fence).
2. **A registry.** On spawn and on every state change Servex writes
   `{id, role, name, topics, page, state, visibility, session_id, started_at, parent}` —
   `topics` and `page` come from the spawn call — to `%LOCALAPPDATA%/lew42/servex/registry.json`
   (whole-file rewrite is fine; it is small and Servex is the only writer) AND appends the change
   as an event to `servex.jsonl`. `GET /agents` returns it. `list_agents` returns the same rows.
3. **`say.mjs state` prints the registry** — a `MASTERMINDS` block (one line per live
   mastermind/task-mastermind with its topics and page) fetched from `GET
   http://127.0.0.1:8090/agents`, falling back to today's single `mastermind_session` line when
   Servex is not answering. Nothing else in `say.mjs` changes.
4. **`Servex/agents/readme.md`** gets one short section: roles and the registry, five lines.

## Fence

`Servex/agents/**`, `Servex/Servex.js` (only what registering needs — Edit, never Write; the
`HOST` env line stays), `.claude/skills/every-prompt/say.mjs` (deliverable 3 only), your task
dir. Append-only to `.jsonl`. Not the skills' SKILL.md files, not `Server/`, not `public/`.

## Length

`roles.js` under 60 lines; registry code under 60. Landing report: six sentences with the fence
proof named.
