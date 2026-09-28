# The objects, and the two phase lists

## The shape
```
Collab              one run: question, kind, cost, winner
  .members[]        Collab.Member — id, model, files{phase → {file, cost, status}}, cost, status
  .phases[]         Collab.Phase — n, kind, status, cost, votes[]
  .votes[]          Collab.Vote — phase, member, pick, caveat
  .decisions[]       Collab.Decision — id, phase, parent, ask, package, options[], counts,
                     chosen (the vote's own winner), runner_up, overruled, final (owner's pick)
Collab.Scoreboard    the shared public/framework/ai/collab/scoreboard.jsonl — per-model
                     decisions/wins/win_rate/cost/cost_per_win, and retire()
```

Every field above comes straight off a `collab.jsonl` line — see the contract
(`/framework/ai/2026-09-28/collab-rounds/collab-format.md`) for the wire shape. `Collab`
replays it exactly the way `JSONL`/`TaskJSONL` always have: one line, one verb, later lines for
the same id merge onto the earlier one instead of replacing the object.

## The two phase lists
- **research** (the default `kind`): `brief` → `read-peers` → `revise` → `vote`. Everyone
  answers, reads 1–2 peers, rewrites their own, votes with a caveat.
- **design**: `names` → `vote` → `implement` → `cross-review` → `vote`. Names first (so the
  class, its properties and methods are agreed before anyone writes code), then everyone
  implements the winning names, reads a couple of peers' code, and votes again on the
  implementation.

## The decision tree
Every vote phase produces exactly one `decision` — the runner itemizes each member's output as
an option, appends it `open`, runs the vote, then rewrites the SAME id `decided` (later line,
same id, wins — the same merge rule `ask`/`decision` already use in `TaskJSONL`). A `package:
true` decision is a whole signature set voted as one (the owner: "one method name affects
another … so that's kind of where the mastermind might need to coordinate the whole decision
tree"); a later decision can name `parent: "<id>"` to vote on a detail inside the winning
package, and `Collab.children_of(id)` is how the view finds it to nest.

**The owner overrules by clicking a different option in the `Decision` widget** — that write
lands as `collab.jsonl`'s own `chose` line, `{decision, option, at, by}`, where `option` is the
clicked option's `say` text (what `ux/Content/Decision.js` writes when clicked), not its `key`.
`Collab.Decision.override()` resolves that text back to a key and sets `overruled` and `final`;
`winner()` returns `final` once there is one, else the vote's own `chosen`. The vote's winner is
never erased — `chosen` still reads what the vote actually decided, and `overruled` is how a
reader tells the two apart.

**Every alternative stays visible, ranked by its own votes, zeros included** — the view never
shows only the winner and the runner-up. The winner is trusted by default and leads; the rest
sit one click down in a `<details>`.

## Addressable, and linked from where a name shows up
Every decision's own card carries `id="<its own id>"`, so `/framework/ext/Collab/?src=<a
collab.jsonl>#d-1` both loads that run and scrolls straight to decision `d-1`, opening its
alternatives. That is the exact link `Collab.Decisions.for(module, member)` builds, reading the
shared `public/framework/ai/collab/decisions.jsonl` — one `named` line per class, property or
method a WINNING `package` decision settled (the runner writes it, once, when that decision is
decided). `ext/Doc` is meant to call `for()` once per page load and draw a ⋯ after any member
name it finds there; this task does not touch `ext/Doc` itself.

## The scoreboard
`Collab.Scoreboard` is its own small `JSONL` subclass reading a file OUTSIDE any one run —
`public/framework/ai/collab/scoreboard.jsonl` — because the whole point is comparing models
ACROSS runs. Each row is one member's participation in one decision; `models()` aggregates by
`model` (two members can share a model id), and `retire()` is the owner's own rule
(owner-words-3.md): once a model has at least 5 decisions to judge it by, a win rate under 15%
and a cost per decision above the median of the models being compared, it is a candidate to
retire. The runner decides what to DO with that (warn, or swap the model out under
`collab.json`'s `"auto_retire": true`) — this module only computes the number.
