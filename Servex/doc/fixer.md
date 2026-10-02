# The fixer — the fast path from "fix this" to a live edit

**The owner, in the dictation this task was briefed from** (quoted in this task's own
`ai/2026-10-01/quick-fix-path/fixer/requirements.md`): *"if we have a quick fix branch that's
always ready to go we should be able to reduce the time to first fix... grab an existing quick-fix
worktree, write the change, smoke test it all at once, and then merge its own worktree."* This is
that: one standing agent that is always warm, always holding a worktree, so a
small spoken change — "make this bold", "this gap is too big" — lands live in roughly 10-30
seconds, with nothing spun up on the hot path.

## The hot path, end to end

```
voice "make this bold"
  → the smart assistant calls quick_fix({page, selection, text, session})   ~0 s   (a Servex tool, node)
  → node writes the ASKED line to public/framework/ai/quick-fix/page.jsonl  ~0 s   (law 7: measured, never recalled)
  → node hands the request to the standing fixer, fixer-1 (send_to_agent)  ~0 s   (no spawn, no new worktree)
  → the fixer edits its OWN worktree, commits, merges it                   ~5-20 s (node Server/merge.mjs)
  → the fixer calls quick_fix_landed({asked_at, sha, files, lines, ...})   ~0 s
  → node computes ms = now - asked_at, writes the LANDED line              ~0 s
  → the owner's page reloads (or streams); the fixer posts one chat line
```

Too big (more than one module, a whole new feature, a layout change, or the merge gets refused
twice) → the fixer says so in one line and `spawn_agent({role: "task-mastermind", ...})` with the
request verbatim; it never stalls on the hot path, and goes straight back to idle.

## The standing agent

`fixer-1` is spawned once, at Servex boot, by `Fixer.js` — the same shape as the fast assistant
(`Assistant.js`): one Claude session, a plain-string `system` prompt (`fixer.md`, read once and
cached), `permission_mode: bypassPermissions` (its whole job is editing files and running `git`
and `merge.mjs`, which a non-interactive session can't be asked to approve one tool call at a
time), and `dormant_after: "session"` so it never auto-sleeps for as long as Servex is up — the
same word the voice pair uses for the same reason: many small requests, and exiting after each
one would mean paying a cold-resume cost (measured 3+ seconds) on every single fix.

**It holds one pool worktree for its whole life.** Most agents that take a worktree
(`take_worktree`) give it back when they're done (`return_worktree`); the fixer instead takes one
slot ONCE, at boot (`Pool.take_sync`, the synchronous twin of `take_worktree` — `Agents.spawn()`
can't `await` a whole worktree-prepare cycle), and calls `pool.hold(slot.id, "fixer-1")` so the
pool's own ten-minute sweep (`Pool.reclaim()`, see `doc/pool.md`) can never decide to hand its
slot to someone else. Without the hold, a Servex restart's own "the registry still says stopped,
`revive()` hasn't run yet" window looks exactly like the false alarm `doc/pool.md` already
documents happening to qf-9 on 2026-09-30 — a holder that LOOKED stopped while it was still very
much alive and about to write there. `Pool.hold()`/`unhold()` and the test proving it:
`Servex/Pool.js`, `Servex/pool-hold.test.mjs`.

**If no slot is ready at boot** (the pool is still warming up, or every slot is taken by other
work), `Fixer.start()` logs it and gives up quietly — `quick_fix`'s own handler tries
`fixer.ensure()` again on the very next request, so the system recovers on its own the moment a
slot frees up, with no restart needed.

## The two tools (`Servex/agents/tools.js` + `Servex/agents/Sessions.js`)

**`quick_fix({page, selection, text, session})`** — the door in, called by the smart assistant
(one paragraph in `session-smart.md` tells it when). Writes the `asked` line to
`public/framework/ai/quick-fix/page.jsonl` itself, in node, then hands the request on to
`fixer-1` with `send_to_agent`: `priority: "now"` when the fixer is idle (nothing real to
interrupt), queued behind its current turn otherwise — the answer says `"fixer busy, N ahead"`
when that happens, so the caller can tell the owner.

**`quick_fix_landed({asked_at, sha, files, lines, width, shot})`** — called by the fixer itself,
once its own `merge.mjs` run has actually succeeded. `ms` is computed HERE, in node, as
`Date.parse(landed_at) - Date.parse(asked_at)` — never something the fixer states, because a
model's own sense of elapsed wall-clock time is a guess, not a measurement. Everything else
(`sha`, `files`, `lines`) is real tool output the fixer only relays.

## The page

[`/framework/ai/quick-fix/`](/framework/ai/quick-fix/) reads `page.jsonl` and folds each
request's two lines (same `asked_at`) into one row: the page, the words, the element picked, and
once it lands, the seconds and a screenshot when the fixer took one. The page only reads; see its
own `readme.md` for the file shape.

## Watch out

- **`merge.mjs` needs `--no-review "…"` for now.** A light or full-size branch normally needs a
  human review before it merges (`Server/doc/review.md`); a quick fix skips that on purpose — see
  `fixer.md` step 5 — until `merge.mjs --quick` (the sibling `quick-merge` task) lands its own
  size threshold for this exact case.
- **The fixer never gives its worktree back.** `return_worktree` would refuse it anyway (a taken
  slot that's clean and merged is fine to return, but nothing here ever calls it) — the whole
  point is that it is always the SAME worktree, always warm, never rebuilt.
- **A `quickfix` row with no `landed` line yet is not stuck — it's probably still being edited.**
  The page shows it as "the fixer is on it…" rather than hiding it; if it sits there for minutes,
  something really did go wrong (check `list_agents` for `fixer-1`'s state).
- **`SERVEX_NO_FIXER=1`** boots without it, same pattern as every other optional piece of Servex
  (`SERVEX_NO_POOL`, `SERVEX_NO_ASSISTANT`, …). The fixer also needs the pool
  (`SERVEX_NO_POOL=1` leaves `servex.pool` unset, and `Fixer.start()` says so and does nothing).

## More

- [`/framework/ai/quick-fix/`](/framework/ai/quick-fix/) — the live log
- [`doc/pool.md`](pool.md) — the worktree pool the fixer holds one slot of
- `Servex/agents/Fixer.js`, `Servex/agents/fixer.md` — the code and the brief
- `ai/2026-10-01/quick-fix-path/` — the task this shipped under: the plan, the owner's own words,
  and the sibling `quick-merge` task (`merge.mjs --quick`, still landing)
