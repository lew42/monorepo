# Servex mastermind: checkpoint, 2026-09-28

Start here, fresh. Load the `servex-mastermind` skill, then read this file, then `ai/todo.md`.

## In flight (report to this day's task.jsonl when they land)

| Agent | Job | Session |
|---|---|---|
| task-mastermind-hidden-windows | PRIORITY: terminal pop-ups. Reproduce from a parent with no console, fix every launcher, enforce it with syntax-guard plus Server/window-lint.mjs | b42621ed-33f7-41f0-b19b-12c679306b9a |
| task-mastermind-smoke-links | merge.mjs finds changed pages and smoke.mjs follows their links (404 or Page load error fails); new pages get a 1920 shot | b784a919-ce8c-4785-90d5-92b615b91d7c |

When each lands, check the proof it names (a picture or a number), then post one line on card `live`.

## What runs by itself now

- **The landing check:** `.claude/hooks/ledger.mjs` starts `Server/on-landing.mjs` once per landing. It runs layout-check, padding-check and clarity, and only the flags reach the servex-mastermind day task.
- **The guards:** the syntax guard checks every .js write for parse errors and missing windowsHide.
- **Restarts:** Servex restarts are batched. Boot the queued code privately first (`SERVEX_PORT=8191 SERVEX_PROXY_PORT=8192 SERVEX_NO_GATE=1 SERVEX_NO_LAYERS=1 LOCALAPPDATA=<scratch> node Servex/index.js`), then run `node Servex/sustain.mjs --restart` when no agent is working.

## Open, waiting on the owner or on dispatch (all on card live or in todo.md)

- **A checkpoint commit of the main tree.** 72+ files are uncommitted, from several agents, and merges into the main tree are refused.
- **The lobby files the owner's words by guessing.** Servex/agents/Assistant.js words() calls file_to_group, and the rail box doesn't send the card on screen. The owner's words landed on Dictate, out of sight.
- **A fresh AI 2 lead.** Start it from the handover in /framework/ai2/readme.md. It owns the resurfacing bar, the Assistant box at 0px on 1280, and the card header cost versus the rail cost.
- **A native Servex crash** (0xC0000409) at 2026-09-25 21:44, with no report written. Watch for a repeat.

## Patterns worth knowing (the evidence is in the day logs)

1. **Agents rarely load reference skills.** In about 56 tasks, the layout skill was loaded 0 times and the page skill once. Put the key rules in the `minion` skill, which every worker carries, and back them with a check.
2. **Anything that must hold needs a check, not a rule.** Pop-ups, padding and broken links all got past written rules.
3. **Managers and masterminds can only message mastermind-servex,** so it becomes a switchboard. The proposal is in todo.md.
4. **Contexts grow past 150k to 480k.** Land them and start fresh from the readme. This checkpoint is that step for mastermind-servex itself.
5. **Before any spawn, check `list_agents` for someone already on the subject.** On 09-25 a duplicate padding checker cost $1.12.
