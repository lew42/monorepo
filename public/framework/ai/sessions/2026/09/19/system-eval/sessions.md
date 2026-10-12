# Session ids, explained — and the design for tracking them

## The plain facts, checked on this machine

1. **A session is one file.** `C:\Users\mike\.claude\projects\C--Code-lew42-monorepo\<uuid>.jsonl`. The folder is the folder the session started in, with every character that is not a letter or digit turned into `-`. Verified: this session's file exists at that path with exactly the id the brief chose, created 18:41:01 today, 1.6 MB by 18:51. In-process subagents write under `<uuid>\subagents\agent-<id>.jsonl` — 464 of them here, from 9 sessions.
2. **`claude --session-id <uuid>` picks the id up front** — proven by fact 1. **`claude --resume <uuid>` reopens it from any folder** — tested by the brief's author at 17:39 from this folder and another; this session could not run the command (shell writes were refused), so that rests on their test.
3. **This repo has 55 top-level transcripts, 208 MB, the oldest from 2026-08-27.** The brief's 47 files and 1.1 GB counted the subagent files too — 519 files in all. Eight were born between the brief and now: this one, a new mastermind, and its six Sonnet minions.
4. **Sidebar tabs are the same kind of file.** Every tab ever opened in this folder is one of the 55.
5. **Transcripts are deleted after `cleanupPeriodDays`, default 30.** This session could not read `~/.claude/settings.json` (blocked outside the working directory); the brief's author read it: unset. The oldest files turn 30 days old on 2026-09-26. One owner item, one minute: set it high.
6. **Where the repo points at a session today.** `session_id` in each task's launch line (the ledger keys on it — but only the FIRST assign line, so a wrong id there is permanent); since 18:49 tonight, `agent` lines with `session_id` in the new mastermind's run log; `mastermind_session` in a run log, which is a tab NAME (`monorepo-00`) for `SendMessage`, not a uuid; one id written by hand in `handover.md`. Three shapes, no complete list.
7. **`CLAUDE_CODE_SESSION_ID`** could not be read from this session: the `Env:` provider, `$env:` strings and shell expansion were all refused. The launch-line recipe in new-task reads it; the brief says not to trust it; the script below makes the question disappear, because it minted the id.

## Three verbs, each one command

**start** — `node .claude/sessions.mjs start <slug> --role minion|mastermind|master|assistant|library --page /path/ --model <full id> --effort <level> --brief <file>`

1. Mints a random v4 uuid. Never a patterned one: the six Sonnet minions started tonight carry `a1c1d1e1-0001-4a19-9b01-000000000001` and so on — legal, resumable, and a collision the day another run picks the same pattern. Meaning goes in the registry line, not in the id.
2. Appends one line to `public/framework/ai/sessions.jsonl`: `{id, at, role, task, page, model, effort, cwd, parent}`.
3. Writes the task's `task.jsonl` line 1 with `session_id` equal to that uuid — so `ledger.mjs` and the Stop hook know the minion from its very first Skill call, and the "skills loaded" question becomes answerable.
4. Runs `claude --session-id <uuid> -p "<prompt>" --model … --effort … --permission-mode bypassPermissions --output-format json` from the repo root, stdin closed (`stdio: ignore` — three seconds otherwise, measured by model-latency), as a background child.
5. On exit, appends an `agent` line (cost, turns, the final text) to the parent's run log and marks the registry line `landed` or `failed`.

The cwd is always the repo root: resuming by id works from any folder (the brief's test), but the folder decides which `CLAUDE.md`, skills, hooks and settings load, and which project folder lists the transcript. Path-specific work is tracked by the `page` field, never by starting somewhere else.

**message** — `node .claude/sessions.mjs message <id> "<prompt>"`

Runs `claude --resume <id> -p "<prompt>"` with the same model and effort as the session (a different effort is a full cache miss, measured today). One lock file per id in the OS temp dir, so a second message to the same id waits — the model-latency task never reached its "two processes on one id" cell, so the lock is a precaution, not a measured need; measure it once, then loosen if it proves safe. The reply is the command's stdout; the script appends it to the target's task log as a `chat` line (`from: <caller>`), so the exchange is on disk.

Three plain facts before relying on it: a message is a whole turn that runs in the SENDER's process and returns when it ends, so "in parallel" is true across sessions and false within one; nothing arrives anywhere by itself — the sender reads the reply from the command's output; a tab the owner has open on that session does not show a headless turn live.

**fork** — `node .claude/sessions.mjs fork <library-id> --n 3 -p "<one job>"`

Runs `claude --resume <library> --fork-session -p …` N times from one call, same model and effort as the library; each fork gets its own uuid and its own registry line with `parent: <library>`. Why a library and never a working session: the fork skill's measured story — nine forks of an orchestrator each tried to continue the orchestrator's own fan-out, zero files, $9.74. A library holds context and no task.

**list** — `node .claude/sessions.mjs list [--page /x/] [--role minion] [--open]`

The registry merged by id, joined with each task's `landed_at`. "Who owns /x/" is the newest unlanded line with that page.

## The registry — the verdict

**Yes: `public/framework/ai/sessions.jsonl`, append-only, merged by id, written by the script and nothing else** — the brief's decision, with two adjustments.

- **`status` is derived, never written by hand.** Landed comes from the task's `landed_at`; running from the child process still being alive; so there is nothing to keep in step between the registry and the task logs.
- **It exists for the sessions that have no task.** The fast assistant's tab, the master assistant, the mastermind's own tab, a library kept for forking — these have nowhere else to be listed, and "resume this session" on the board needs them most.

**The alternative, and why not.** No registry, only the `session_id` already in each `task.jsonl`: nothing new to keep in step, and the ledger already walks every task log in about 18 ms, so "who owns this page" is a cheap scan. It is enough for minions alone. It cannot list the roles above minion, and "each path could have" a session needs a `page` field that a task's launch line can carry but nobody would find. Two stores that could drift is the owner's stated objection to two dashboards; the script writing both fields in one call is what removes the drift.

## The word

**start · message · fork.** "Spawn" leaves every skill — the mastermind skill uses it about twenty times, in both senses. "Subagent" stays for the in-process tool's throwaway lookups inside one turn.

## What changes in the skills because of this

- **mastermind**: §"A minion is a CLI session" becomes the three commands (change 1); §Spawn, §Harvest and the follow-up bullets stop describing `SendMessage` and background waits; `mastermind_session` becomes the run's uuid.
- **every-prompt**: the doorbell becomes `message <mastermind id>`; "no mastermind running" becomes `start --role mastermind`; the owner's ask — the fast assistant starts the master assistant and relays every prompt — is `start --role master --model claude-fable-5-1 --effort max --lean`, then `message` per prompt. `--lean` is the 823-token profile model-latency measured (strict MCP config, minimal tools): at the 41k-token prefix a relayed prompt costs about 90 cents a turn; lean, about 2 cents.
- **minion**: "your launch line exists; append to it"; the fence names the minion's OWN scratchpad; the progress card and the reload hold are the script's to run at start and landing, so a minion without a shell still has them.
- **fork-claude-session** becomes **sessions**: the why and the measured facts, about 120 lines.
- **Server/plugins/CardAnswer.js** rings a session by `message <id>` instead of a headless `SendMessage` turn aimed at a tab name.
- **.claude/hooks/readme.md**'s "subagents share the parent's session_id" paragraph becomes history; **handover.md**'s "session ids worth resuming" becomes `list`.
