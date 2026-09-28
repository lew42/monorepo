# collab — a few agents work the same question, then vote

`Server/collab.mjs` runs one **collaboration**: several Servex agents (the **members**) go through
the same numbered steps (the **phases**), one phase at a time — everyone finishes phase 1 before
anyone starts phase 2 — and end by voting on the best draft. It is the runner for the shape both
this doc and the live page agree on: `public/framework/ai/2026-09-28/collab-rounds/collab-format.md`.

## Write a `collab.json`

Put this next to where you want the run's files (`<taskdir>/collab.json`):

```json
{
  "question": "What is the boiling point of water at sea level, in Celsius?",
  "kind": "research",
  "members": [
    {"id": "haiku-a", "model": "claude-haiku-4-5-20251001"},
    {"id": "sonnet-b", "model": "claude-sonnet-5"}
  ],
  "context": ["public/framework/ai/2026-09-28/collab-rounds/some-background.md"]
}
```

- `kind: "research"` — facts → brief (answer + a rough web search, sources listed) → read-peers →
  revise → vote. `kind: "design"` — facts → names (the class, its properties, its methods and
  their arguments) → vote (on names) → implement (everyone builds the WINNING names) →
  cross-review → vote. Both kinds now start with `facts` (below) before anything else.
- `context` is optional: files every member reads before its first phase.
- `members[].model` is a plain string, so a Haiku/Sonnet mix, or later an OpenRouter id, all work.
- `decisions` (optional): `[{"phase": 2, "ask": "...", "package": true, "parent": "d-1"}]` to name a
  vote's question or mark it a **package deal** (the options are whole signatures, voted as one — the
  design's names vote is a package by default) or to chain it under an earlier decision (`parent`).
- `auto_retire: true` swaps out any member whose model the scoreboard (below) says is retired.
- `target` (optional, design only): `{"module": "ext/Source", "class": "Source"}`. It asks each
  member for a sidecar `<n>-names.json` beside its prose names file — `{"class": "Source",
  "properties": ["url", "kind"], "methods": [{"name": "save", "args": ["dir"]}]}` — so the WINNING
  set can be indexed by name once the names vote is decided (see decisions.jsonl below). Skip it and
  you just get the prose file; nothing else changes.

## Run it

```
node Server/collab.mjs <taskdir>            the real run — spawns real Servex agents, costs real $
node Server/collab.mjs <taskdir> --mock     no agents, canned files and votes, $0 — proves the flow
node Server/collab.mjs --score <taskdir>    turn the owner's overrule clicks into scoreboard lines
```

Run it from the repo root. Every member is one Servex agent, alive for the whole run (`spawn_agent`
once, `send_to_agent` for each later phase), and every one is stopped at the end — even if a phase
errors. A member that times out (10 minutes by default; `timeout_s` in `collab.json` to change it)
is marked `error` in `collab.jsonl` and the run carries on without it.

## Read the result

`<taskdir>/collab/tally.md` is the one screen: the winner, its file, which tie-break rule fired (if
any), the vote counts with each member's cost, and every caveat a voter left. The full trace — every
phase, every member's file and cost, every vote, and a `decision` line per vote (opened with the
options, then rewritten "decided" with the counts — **every option, zero votes included** — and the
runner-up) — is `<taskdir>/collab.jsonl`, one JSON object per line, append-only; the contract above
names every verb.

A model's track record across every run lives in one shared file,
`public/framework/ai/collab/scoreboard.jsonl` (append-only, never rewritten): one line per member
per decision — did it win, how many votes, what it cost. A model with 5+ decisions, a win rate under
15% and an above-median cost prints a warning next run (and gets swapped out if `auto_retire` is on).

With a `target`, once the names vote is decided, one line per class/property/method of the winning
set goes into another shared file, `public/framework/ai/collab/decisions.jsonl` (also append-only):
`{"named": {"module": "ext/Source", "class": "Source", "member": "save", "kind": "method", "collab":
"<taskdir relative to ai/>", "decision": "d-1"}}`. ext/Doc reads this once and draws a ⋯ after any
name it finds there, linking to `/framework/ext/Collab/?src=/framework/ai/<collab>/collab.jsonl#d-1`
— so a class page can point back to the vote that named it, without an AI remembering to wire the
link by hand. A missing or malformed `names.json` from the winner is logged to the console and
skipped: no `decisions.jsonl` lines, nothing else stops.

## Facts first, disputes, and abstaining (2026-09-28)

Every run's phase 1 is always `facts` — each member writes `<n>-facts.json`, an array of
`{id, text, certainty}`: simple, foundational truths ("always X", "never Y", "one A per B",
"before X, do Y"), `certainty` one of `settled`/`likely`/`open` (write "never"/"always" only for
what actually breaks; anything else is `likely`). The runner merges every member's list by
normalized text (case/whitespace-insensitive) into one canonical list — settled only if EVERY
member who listed a fact called it settled, open if ANY member called it open, likely otherwise
— and appends one `{"fact": {id, text, certainty}}` line per merged fact. The canonical `id` is a
short slug of the fact's own text, not a member's own id (members don't coordinate ids with each
other). Every `open` fact is named in the NEXT phase's prompt: "Open facts to dig into: …" — the
least certain things get the most attention.

**Any member, in any phase after `facts`, may dispute one**: write `<its own dir>/dispute.json`,
`{"fact": "<fact id>", "why": "…"}`. The runner checks every active member's own dir after EVERY
phase (not just `facts`) and, for each dispute found, appends `{"dispute": {at, fact, member,
why}}` and deletes the file (so it is never read twice). A disputed `settled` fact drops to
`likely` — written as a fresh `{"fact": {...}}` line, same id (later line wins, same rule
`decision` already uses). An `open` fact is untouched by a dispute — it was already the least
certain there is.

**A vote may abstain.** The vote JSON a member writes may be `{"abstain": true}` instead of
`{"pick": …}` — "I have no opinion", said explicitly. It lands in the same `abstained` list as
"no file" or "an invalid pick" (so the tally's count and `thin` flag are unchanged), but it also
gets its own `{"vote": {..., "abstain": true}}` line in `collab.jsonl`, so a reader can tell a
real, considered non-pick apart from a member who simply never answered.

`--mock` proves all three for $0: canned facts (one settled, one likely, one open), one canned
dispute against the settled fact (settled → likely), and one canned abstain vote.

## Watch out

- `wait_for_agent`'s `cost` is **cumulative for that agent's whole life**, not per phase — the
  runner subtracts the member's cost after the previous phase to get each phase's own number
  (proven with a one-line Haiku probe before this was built: same total before and after `stop_agent`).
  It can also read BEFORE the turn's own cost has landed in Servex's registry — a real vote came back
  costed $0 once — so the runner re-checks `list_agents` once, a couple seconds later, before trusting
  a flat number.
- A worker (a minion) may only `spawn_agent` with `role: "minion"` — `role: "member"` is refused.
  Members show up in `list_agents` as `minion-collab-<run>-<member id>`.
- `spawn_agent` can answer `{"id": null, "queued": true, "reason": "…"}` when the host is low on
  memory (Servex's own admission gate) — that is a WAIT, not a failure. The runner polls
  `list_agents` for the member's own (deterministic) id until it starts, up to the phase timeout.
- **Every member's `<n>-vote.json` is read from disk**, even one whose wait timed out or errored —
  a real vote file turned up on disk from a member the runner had already marked errored on an
  EARLIER phase, and a 1-1 tie was misreported as a 1-0 win before this was fixed. No file = listed
  `abstained` in the decision, never silently dropped; a vote where fewer than half the members
  voted is flagged `thin: true` in both the decision line and `tally.md`.
- **If every member of a phase errors, the run stops** — it writes one `winner` line with
  `status: "failed"` and a `why`, writes a short `tally.md` saying so, and exits non-zero. It never
  marches on to announce a winner from zero real votes.
- The winner's own `file` always points at what it actually WROTE (`brief`/`revise` for research,
  `implement` for design) — never a phase where it wrote about a PEER's work (`read-peers`,
  `cross-review`), even when that review phase happens to run right before the final vote.
- **`--mock` never touches the shared files.** `public/framework/ai/collab/scoreboard.jsonl` and
  `decisions.jsonl` are for real runs only; a `--mock` run writes its own copies inside
  `<taskdir>/collab/`, so a $0 test can never skew the model scoreboard or put a ⋯ link on a class
  that does not exist.
- Every member's prompt says plainly: write ONLY inside your own `collab/<id>/` directory, never
  `collab.jsonl` — the runner is its only writer. A member that ignores this corrupts the log for
  every reader (stray lines were found in a real run before this line was added).
- The contract's `Vote` shape (`member`, `pick`, `caveat`) is shared with the check-consensus task —
  do not rename those three fields.
