# Minion brief: policy.js, who may message and spawn whom

Load the `minion` skill first, then the `code` skill.

## The owner's words

"If Servex starts all three by default and we get a solid system where they communicate effectively, they need to use their own identifier when talking, so it's clear whether it's me or one of them, and who. And they'd send messages back to the proper session."

And earlier (handoff2.md item 4): "a mastermind must reach its own children, and the assistants must reach the mastermind. Beyond that, restrict it."

The design: `public/framework/ai/2026-09-24/assistant-layers/doc/design.md`, section "Who may message whom". Read it.

## Where you work

The worktree `C:/Code/lew42/worktrees/assistant-layers` (branch `worktree/assistant-layers`). Every path below is inside it. Commit there when done: one commit, message "Servex: policy.js, who may message and spawn whom", with the attribution line `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Never touch the main tree at `C:/Code/lew42/monorepo`.

## Deliverables

1. **`Servex/agents/policy.js`**, a `Policy` class in house style (assign-based: `constructor(...args){ this.assign(this.defaults(), ...args) }`, every method a seam). It is built with `{ agents }` (the Agents host; `agents.live` is a Map of id → agent, each with `.parent` and `.role`).
   - `kind(id)`: `"owner"` for null/undefined/`"owner"`; `"assistant"` for `assistant-*`; `"manager"` for `manager-*`; `"master"` for `master-assistant` (and any id starting `master-assistant`); `"servex"` for `servex-mastermind`; `"task-mastermind"` for `task-mastermind-*`; `"system"` for `dispatcher`; everything else `"worker"` (minions, helpers, forks, jobs).
   - `card(id)`: for `assistant-X` or `manager-X`, returns `X`; else null.
   - `message(from, to)` → `{ ok, rule, why }`. Allowed when ANY of these holds, and `rule` names which:
     - `owner`: from is the owner (null caller).
     - `system`: from is `dispatcher`, or `servex-mastermind`.
     - `tree`: `to` is `from`'s parent, or `from` is `to`'s parent (read `agents.live.get(id)?.parent`).
     - `reply`: `to` messaged `from` within the last 30 minutes (see `heard`).
     - `table`: assistant → its own card's manager (same `card()`), `master-assistant`, `servex-mastermind`; manager → its own card's assistant, `servex-mastermind`; master → any assistant, `servex-mastermind`; task-mastermind → `servex-mastermind`.
     - Otherwise `{ ok: false, why: "<from> may not message <to>: <one plain sentence naming who it may message instead>" }`.
   - `spawn(caller, role)` → `{ ok, why }`. Owner and `servex-mastermind` and `dispatcher` may spawn anything. `assistant` and `master` may spawn nothing through `spawn_agent` (they get their own tools later). `manager` and `task-mastermind` may spawn anything EXCEPT roles `task-mastermind`, `manager`, `mastermind`, `master-assistant`, `assistant`. `worker` may spawn only `minion` and `helper`.
   - `heard(from, to)`: records that `from` messaged `to` now (a Map keyed `to→from` holding a timestamp), for the reply rule.
   - `refused`: an array of the last 50 refusals `{at, from, to, why}`; `refuse(entry)` pushes and calls `this.onrefuse?.(entry)` (a hook Layers.js will set to write Servex's log).
   - `rules()`: returns the table as plain data (rows of `{from, may}`) for a `/api/policy` page to show.
   - `SERVEX_POLICY=off` in the environment makes both checks always `ok` with `rule: "off"`.
2. **`Servex/agents/tools.js`**, two small changes only (another agent is also editing this file, so keep the diff to those lines):
   - At the top of `tools(agents)`: `const policy = agents.policy ??= new Policy({ agents });`
   - `send_to_agent`'s handler becomes `(args, ctx = {}) => { … }`: `from = ctx.caller ?? args.from ?? null` for the check, but `ctx.caller`, when present, is the identity (a Servex agent's connection is stamped `?as=<id>` by another agent's change; a tab has no caller and is the owner). Run `policy.message(ctx.caller ?? null, id)`: note it is the CALLER, not the typed `from`, that is checked, so a tab typing any `from` is still the owner. If refused, return `JSON.stringify({ ok: false, why })` and deliver nothing. If allowed, deliver with `from: ctx.caller ?? args.from`, call `policy.heard(ctx.caller ?? args.from ?? "owner", id)`, and return the card as before.
   - `spawn_agent`'s handler: `(args, ctx = {}) =>` run `policy.spawn(ctx.caller ?? null, args.role)` first; refused → `JSON.stringify({ ok: false, why })`.
3. **`Servex/agents/policy.test.mjs`**: plain node, `node:assert`, no framework. Builds a fake `agents` (`{ live: new Map([...]) }`) and checks every rule above allowed and refused, including: the reply rule allows then expires (fake the clock by passing `now` or by setting the Map entry's time back); a tab (null) may message anyone; `assistant-a` may not message `manager-b`; `manager-a` may not spawn `task-mastermind`; `SERVEX_POLICY=off`. Prints `policy: N checks passed` at the end.

## Done means

- `node Servex/agents/policy.test.mjs` passes, run from the worktree root.
- `node -e "import('./Servex/agents/tools.js').then(m => console.log(m.tools().length))"` from the worktree root prints a number (the module still loads).
- Committed on `worktree/assistant-layers`, nothing else touched. Your last words: the commit hash, the test output line, and anything you could not do. Length budget: policy.js under about 120 lines.
- Never write the owner's name.
