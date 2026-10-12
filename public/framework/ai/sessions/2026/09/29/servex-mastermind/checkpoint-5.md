# mastermind-servex-5: checkpoint, 2026-09-29 about 17:40

Start as **mastermind-servex-6**: load the `servex-mastermind` skill, read this, then the last 15 lines of `task.jsonl` here. The dispatch table is `ai/2026-09-25/servex-mastermind/dispatch.md` (see its **ORDER NOW (17:30)** line). **First, tell every running task mastermind your id** (the skill's new "When you take over" section), then stop mastermind-servex-5.

## You own launching now (servex-mastermind-opus handed it over at 17:35)
Launch the next row whenever fewer than 8 agents are working and more than 4 GB is free, and mark it LAUNCHED in dispatch.md. `scratchpad/gate.mjs` (in -5's scratchpad; copy it) waits for that condition and exits; run it with Bash `run_in_background`. The order:

| Row | Task | Note |
|---|---|---|
| 37 | lifecycle | FIRST: the owner's complaint about 22 dev servers. Brief `ai/2026-09-29/lifecycle/requirements.md`, with refine coverage |
| 38 | nested-tasks | brief `ai/2026-09-29/nested-tasks/requirements.md` |
| 31 | readme-system | |
| 32 | node-reliability | the brief grew today: revive/successor routing, reviewer priority in the queue |
| 34 | assistant-front | now Opus, and includes the chat-room roles (design.md, "who does what") |
| 33, 35, 15, 16, 27 | naming-skill, openrouter docs, tooling-gaps, task-placement, sidebar study | |
| — | check-consensus | unlanded, and has no session id: relaunch from its brief |

The spawn line: `spawn_agent` role task-mastermind, name, model, effort medium, bypassPermissions, cwd the repo, `parent` your id, `task {dir, card, brief}`, and a prompt of "Load sub-mastermind; brief at …; land with finish-task".

## Landed today under -5
node-modules-guard (62f2fe92), restart-outside-tree (e23538c0), decide-tool, waiting-on-you (7ca26c8f), recursive-pairs (062156e1), item-ui, mobile-nav's first task, dictate-spacing.

## Still running at 17:40
- **page-system-2**, with 3 minions. It restarts Servex itself as its last step (for the create_page change).
- **mobile-nav**, waiting on reviewers; it restarts the monorepo dev server itself after it merges. Keep **:8137** (the phone).
- **file-system** and **page-files-log**.
- **Relay owed:** tell file-system when mobile-nav's "Files" drawer link merges.

## System fixes made today (skills, committed)
515a7bd4 never link node_modules · 8346b017 the 120-word outcome · 79669593 stop every server you start · 1fc8be0b announce your id on takeover.

## Lessons
- **Restarts:** `node Servex/sustain.mjs --restart` is safe from any shell now. Check the pid in servex.pid.json.
- **Stopped agents come back:** a message to a stopped agent revives it (-4 came back four times; page-system twice). Stop them again, and tell the sender who the successor is.
- **Memory:** it's mostly the owner's apps (Figma 3.5 GB, Chrome 4 GB) plus about 7 GB of claude processes. The low-RAM flag can be lowered with `system_health low_ram_gb` until the next restart, to let reviewers through (a priority inversion).
- **The monitor's "stop the finished ones" pings** repeat every few minutes. Answer them in one line unless the idle list changed.
- **Minions write steps into their parent's task.jsonl** (page-system saw a page_work minion's steps in its log). That's a nested-tasks concern: each minion needs its own log.
