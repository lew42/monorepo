# The phases, re-cut against what exists after today

The owner's original three phases were written before any of this was built. Today four tasks are
building the substrate at once — [`servex-port`](../../servex-port/) (the proxy, the process
supervisor, the single-writer log, the `/mcp` seam), [`agent-host`](../../agent-host/) (spawn,
send, interrupt, list, and one typed event per SDK message), [`log-model`](../../log-model/) (the
event schema and the fold) and [`worktree-design`](../../worktree-design/) (where a worktree goes
and what it costs). This file says what is still missing when those four land, and what phase 2
actually is.

## Phase 1 — what it still lacks once today's four land

Phase 1 was "audit and port Servex; log writer; spawn/send/interrupt streaming to a minimal UI;
worktree design settled on paper". Seven things will still be open:

1. **Nothing is wired to anything.** `agent-host` exports an array of four tool definitions;
   `servex-port` exposes a registration seam. Neither imports the other, by design. Somebody has
   to connect them and prove a spawn from a real sidebar session.
2. **Two writers, one file.** `agent-host` appends to its own JSONL with `fs.appendFile`;
   `servex-port` owns `Servex/Log.js` as the single writer. One seam (`this.log`) has to point at
   the other.
3. **The dashboard cannot see a Servex-hosted agent at all.** The board reads `task.jsonl`;
   sessions write `agent-<id>.jsonl`. `log-model` writes the fold from one to the other on paper;
   nothing runs it.
4. **There is no registry.** Nothing writes `{id, role, topics, page, state, visibility}` anywhere
   the fast assistant can read it, so routing to one of several masterminds still cannot work.
5. **`spawn_agent` does not load a role skill.** It takes a prompt. An agent's posture — minion,
   task mastermind, log assistant — should come from its `role` field, not from remembering to
   say it in the prompt.
6. **Nothing renders a `delta`.** Phase 1 asks for streaming to a minimal UI; the events will
   exist and no screen shows them.
7. **A worktree has never actually been proven on this repo.** The design and the measurements
   will be settled; one real task run inside one is not.

## Phase 2 — the ordered task list

Each line is a brief a master-mastermind can dispatch as it stands. They are in dependency order;
3, 6 and 9 can run beside the others.

1. **`servex-wire`** — register `Servex/agents/tools.js` on the `/mcp` seam; prove `spawn_agent`
   from an ordinary sidebar Claude session, with one Haiku agent that runs `node --version` and
   writes a file.
2. **`servex-log-single`** — point `Agents.log` at `Servex/Log.js`; prove two agents writing at
   the same moment produce no torn and no interleaved lines.
3. **`agent-registry`** — write `{id, role, topics, page, state, visibility}` on spawn and on
   every state change; `say.mjs state` prints it; the fast assistant routes off it instead of off
   a single `mastermind_session` field.
4. **`spawn-role`** — `spawn_agent({role})` loads that role's skill before the agent's first turn;
   prove it by spawning a minion whose prompt says nothing about fences and watching it respect
   one.
5. **`board-from-events`** — run `log-model`'s fold for real, so a Servex-hosted agent appears on
   `/framework/ai/v/3/` without anyone hand-writing a card.
6. **`prompt-lifecycle`** — raw → refined → pre-proposal → proposal → build, with the fast
   assistant naming at once and the owner's optional ✓/✗ per item. The naming rules become checks
   in the appender, not prose.
7. **`worktree-proof`** — one team, one worktree, its own dev server reachable at
   `<task>.localhost` through the proxy, a real task landed in it and the worktree removed.
   Confirm `worktree-design`'s measured 3.1 s / 274 MB on a run that does real work.
8. **`sub-mastermind-live`** — one task mastermind, Servex-hosted, spawning two minions as events.
   The proof is the failure reproduced and fixed: it must not park when a minion finishes.
9. **`stream-ui`** — render `delta` events on the dashboard as the agent types, so the owner
   watches a live transcript instead of waiting for a card.
10. **`skills-shrink-2`** — apply the mastermind split and the four unapplied changes from the
    2026-09-19 audit; measure the always-loaded set per role against the numbers in
    [skills.md](skills.md).

## Phase 3 — named, not planned

Parallel teams on one task with a judge merging the best of each; minions spawning minions; the
object layer (one `{target, method, args}` envelope, three generic MCP tools, JSDoc as the tool
documentation); Whisper in the loop so a dictation becomes log entries without anyone typing.

Each of those is cheap to start **only** once phases 1 and 2 are real, which is the whole argument
for doing them in this order: every one of the four needs a live registry, an event stream a
parent can be woken by, and a worktree that has been proven on this repo.
