# Roles, settling, and mastermind process: report

## What was asked, what happened

- [x] **A. How roles are spawned and prompted.** Answered below. Built: [RoleView](/framework/servex/roles/#mastermind) now lists each role's prompt-source files (commit `69e1f1112`).
- [x] **B. Tasks stuck "running".** Cause found and phase 1 fixed: a dropped task is now stopped with a reason.
- [ ] **B, phase 2.** Parent back-off prompts, a "needs settling" state, escalation. Not built.
- [ ] **A, phase 2.** An ok/missing check and the literal prompt text on the page. Not built.
- [x] **C. Mastermind process, ranked.** Report only, no code.
- [x] **Fast assistant follow-up.** Answered below.

## A. A role's prompt

```
role_system()  Servex/agents/roles.js:180
└── <role-readme> = the role's own file (roles/*.md or a skill's SKILL.md)
    └── mastermind with path: + that folder's readme chain + mastermind.md
```

- The fixed `ROLES` table decides (`roles.js:37-111`). The parent only picks `role` and `path`.
- Only placement is checked (`path_check()`, logged as `path_loaded`). Nothing checks the agent read or obeyed it.

October usage (`node Server/role-spend.mjs`):

| Role | Sessions | Cost |
|---|---|---|
| mastermind | 173 | $1215 |
| minion | 1188 | $469 |
| reviewer | 676 | $177 |
| clarity | 836 | $90 |
| voice-assistant | 17 | $44 |
| session-smart | 82 | $24 |

**Why it went straight to `michael/dev`:** the files were already edited in the main tree, and `git-guard` blocks stash and checkout there. So I committed them by path.

**Why part is not built:** the ok/missing check and the prompt text need a new Servex read route, which is new server surface.

## B. Why tasks stay "running"

Nothing settles a task when its agent exits. `Dropped.tick()` (`Servex/Dropped.js:149-173`) found these tasks but only logged them. It now also writes `{stop:{why}}` on the task's own file. `Dropped.test.mjs` passes.

Phase 2 touches `Task`, `TaskLoop` and the reaper, so it is queued as the next step.

## C. Mastermind process, ranked

1. **Duplicate "done" delivery:** `Agents.js:973-1017` sends a chat message and an inbox line. Send one.
2. **Landing written twice:** `task.jsonl` and `card_reply` (`Agents.js:2299`). Make the reply a pointer.
3. **25 task folders have no parent line** (law 10). `new-task` should write the parent line when it makes the folder.
4. **Chatter:** `Follow.heard()` (`9fae451c1`) already filters it. Harden that allow-list.
5. **Source of truth:** holding. `cards.jsonl` is the one candidate to fold into the task log.

## Fast assistant

It is `voice-assistant` when the voice seat is on, else `session-fast`. Its prompt is `.claude/skills/voice-assistant/SKILL.md`. It wakes once per grouped thought, not per sentence, and gets the heard text plus a short tail (`Sessions.js:1143-1150`, gate `Sessions.js:65`).
