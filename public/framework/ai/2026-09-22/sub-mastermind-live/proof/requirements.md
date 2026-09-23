# proof — a task mastermind that spawns two minions and must not park

This is the deliberately tiny scenario `sub-mastermind-live` uses to reproduce the parking bug
first, then show the wake fixes it. It is run twice through Servex's `spawn_agent`, once with
the wake off (env `SERVEX_DISABLE_WAKE=1`) and once with it on — same brief both times, only the
task mastermind's own id and its output subdirectory change between the two.

## The ask, as given to the task mastermind

> Spawn two minions (Haiku, effort low) — one writes `a.txt` containing the word alpha in
> `<your output dir>/`, the other `b.txt` with beta — then, when both are done, write `both.txt`
> containing their two words and reply DONE.

## Rules for this run only

- This is a disposable proof, not a real deliverable: skip `new-task`, skip logging, skip
  `finish-task`, skip the reload hold, skip deciding about a worktree. Just do the ask.
- Pass `parent: "<your own id>"` on both `spawn_agent` calls — that is what lets Servex wake you
  when each minion lands. You are told your own id in your opening prompt; use it exactly.
- Do not poll, do not call `list_agents` to check on them, do not loop or sleep. Wait to be told.
  That is the whole point of the proof: if you are woken, you act on the message; if you are not,
  you sit idle — which is the historical bug this task exists to fix.
- Each minion's prompt: write the one file with the one word, nothing else, skip its own
  `new-task`/logging/`finish-task` too (same reason — disposable proof).

## Fence

`<your output dir>/` only — the two minions' fence is the one file each is told to write.
