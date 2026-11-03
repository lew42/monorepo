# The clarity hook never reviews a one-pass agent: no reviewer of a reviewer, no heartbeat chase of a reviewer

Budget: $3. Sonnet. Load the `minion` and `code` skills. Your log is this dir's `task.jsonl`.

**Why (`public/framework/ai/todo.md`, the 2026-10-18 21:12 clarity line):** the clarity hook (`Server/clarity.mjs`, and whatever in `Servex/agents/*.js` or `.claude/hooks/*.mjs` spawns a `clarity-<name>` agent on a landing: `grep -rn "clarity" Servex/agents/*.js Servex/*.js .claude/hooks/*.mjs Server/clarity.mjs | grep -v "^.*//" | head -20`) runs on EVERY agent landing, including a clarity reviewer's own landing: on 10-18 20:48 `clarity-clarity-restart-sweep` reviewed `clarity-restart-sweep` ($0.34). One-pass roles (`reviewer`, `clarity`, `checker`: `Agents.ONE_PASS`, since 0ab5016c1) already get no default task dir; the hook must skip them too. Read the hook's spawn site and `Agents.ONE_PASS`.

## Deliverable

1. **The rule:** the clarity hook (and any other landing-triggered reviewer spawn you find) skips an agent whose role is in `Agents.ONE_PASS`, and skips an agent whose id already starts with `clarity-`; one log line the first time per agent. A unit test of the predicate if it is a pure function; make it one if it is not.
2. **Proof on a private Servex** (`SERVEX_API_PORT`, `SERVEX_HOME`, from your worktree): spawn one helper with a bare prompt that lands at once; show exactly one `clarity-<name>` agent appears and no `clarity-clarity-*`; the registry (`/agents`) proves it.
3. One line in `Servex/agents/readme.md` beside the one-pass roles; strike the todo line (`~~`, the landing commit named). Worktree, `node --check`, `Server/smoke.mjs` clean, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the registry count checked with `tail -1`, `git status` clean for your paths. **Never restart the live Servex** (the mastermind does after your merge; say so in the finish line); never drive the owner's tabs.

Fence: the hook's spawn site (`Server/clarity.mjs` or the Servex file that spawns it), its test, the readme line, the todo line, this task dir. Nothing else.
