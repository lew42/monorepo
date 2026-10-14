# The contract both minions share: `collab.jsonl`

One run of a collaboration = one directory, `<taskdir>/collab/`, holding:

```
<taskdir>/
  collab.json          the spec the mastermind writes (question, kind, members, phases)
  collab.jsonl         the run's log, append-only, one verb per line (below)
  collab/
    tally.md           what the mastermind reads: winner, vote counts, every caveat, cost
    <member id>/       each member writes ONLY here
      1-brief.md       one file per phase: <phase n>-<phase kind>.md
      2-read-peers.md
      3-revise.md
      4-vote.json      {"pick": "<member id whose draft wins>", "caveat": "<the one improvement>"}
```

## `collab.json` (input)

```json
{
  "question": "the question, in plain words",
  "kind": "research",
  "members": [
    {"id": "haiku-a", "model": "claude-haiku-4-5-20251001"},
    {"id": "sonnet-b", "model": "claude-sonnet-5"},
    {"id": "haiku-c", "model": "claude-haiku-4-5-20251001"}
  ],
  "context": ["public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-2.md"]
}
```

`phases` may be omitted: `kind` picks the default list.

- **research:** `brief` (answer the question, with a rough web search, sources listed) → `read-peers` (read 1–2 assigned peers' briefs, note what they got that you missed) → `revise` (rewrite your own) → `vote`.
- **design:** `names` (propose the class name, properties, methods and their arguments) → `vote` (on names) → `implement` (everyone implements the WINNING names) → `cross-review` (read 1–2 peers' code: functionally the same? what is better?) → `vote` (on implementations).

A member never votes for itself. `model` is a field, so an OpenRouter model id slots in later.

## `collab.jsonl` (output) — one verb per line, each value carries `at`

```json
{"collab":  {"at": "…", "id": "<slug>", "question": "…", "kind": "research", "members": [{"id": "haiku-a", "model": "…"}], "phases": [{"n": 1, "kind": "brief"}, {"n": 2, "kind": "read-peers"}]}}
{"phase":   {"at": "…", "n": 1, "kind": "brief", "status": "start"}}
{"member":  {"at": "…", "id": "haiku-a", "phase": 1, "status": "done", "file": "collab/haiku-a/1-brief.md", "cost": 0.012, "agent": "<servex agent id>"}}
{"phase":   {"at": "…", "n": 1, "kind": "brief", "status": "done", "cost": 0.03}}
{"vote":    {"at": "…", "phase": 4, "member": "haiku-a", "pick": "sonnet-b", "caveat": "…"}}
{"tally":   {"at": "…", "phase": 4, "counts": {"sonnet-b": 2, "haiku-a": 1}, "winner": "sonnet-b", "caveats": ["…"]}}
{"winner":  {"at": "…", "pick": "sonnet-b", "file": "collab/sonnet-b/3-revise.md", "caveats": ["…"], "cost": 0.09}}
```

## Added 14:15 — decisions, package deals, the scoreboard (owner-words-3.md on the card)

The owner: *"the mastermind would need to make sure everyone's done … then itemize those as the options and then ask everyone to vote. And when everyone's done voting, then there's a winner. And then you proceed."*

And: *"every decision … should be well documented in terms of the number of votes and the winner … what the alternatives were and what was like the runner up."*

**The runner is the mastermind's decision process.** After the phase before a vote finishes, the runner itemizes every member's output as an option, writes a `decision` line (open), runs the vote, then rewrites the same decision id with the result (later line wins, same id). Every vote phase produces exactly one `decision`.

```json
{"decision": {"at": "…", "id": "d-1", "phase": 2, "parent": null, "ask": "Which signature set for the Source class?", "package": true,
  "options": [{"key": "haiku-a", "say": "haiku-a: Source {url, kind, authority, md} + fetch(), save()", "caveat": "", "file": "collab/haiku-a/1-names.md"}],
  "status": "open"}}
{"decision": {"at": "…", "id": "d-1", "phase": 2, "status": "decided", "counts": {"haiku-a": 1, "sonnet-b": 2}, "chosen": "sonnet-b", "runner_up": "haiku-a", "caveats": ["…"], "tie_rule": null}}
```

- `options[]` uses ux/Content's Decision shape (`key`, `say`, `caveat`) so `new Decision({ id, ask, options, log: <collab.jsonl> })` draws it. `say` starts with the member id, so each is unique.
- **Package deals:** `package: true` means each option is a WHOLE set (a class signature: its name, properties, methods and arguments together), voted as one, because one name implies another.

  A later decision may name `parent: "d-1"` to vote on a detail inside the winning set — that's the decision tree. Without a `decisions` list, each vote phase gets a default ask; with one, `collab.json` can set it explicitly:
  ```json
  "decisions": [{"phase": 2, "ask": "…", "package": true}, {"phase": 5, "ask": "…", "parent": "d-1"}]
  ```
- **The owner overrules** by clicking another option in the Decision widget, which appends ux/Content's own line to `collab.jsonl`: `{"chose": {"decision": "d-1", "option": "<say>", "at": "…", "by": "…"}}`. The replay treats that as the final winner, `overruled: true`, and the vote's winner stays recorded as `voted`.

**The scoreboard** (the owner: *"if one model never gets any votes … and especially if it's more expensive, we just kind of phase that one out"*). After each decision the runner appends one line per member to the shared `public/framework/ai/collab/scoreboard.jsonl`:

```json
{"score": {"at": "…", "collab": "<taskdir relative to ai/>", "decision": "d-1", "member": "haiku-a", "model": "claude-haiku-4-5-20251001", "votes": 1, "won": false, "cost": 0.012}}
```

An owner overrule is picked up at the next run's start, or by running `node Server/collab.mjs --score <taskdir>`. It appends one `score` line for the owner's pick (`overrule: true, won: true`) and one for the voted winner (`overrule: true, won: false`).

`Collab.Scoreboard` reads the file and reports, per model: decisions entered, wins, win rate, votes received, total cost, cost per win, and `retire()` — models with 5+ decisions, a win rate under 15%, and a cost per decision above the median.

The runner warns when a spec names a retired model. With `"auto_retire": true` in `collab.json`, it swaps that model for the cheapest one still active.

## Added 14:25 — every alternative, and a link from where a name shows up (file-explorer-fs/owner-words.md, first half)

**Every alternative stays, with its votes.** A `decision` keeps all its `options` and `counts` for every option, zero included. Views list them all, ranked by votes; `runner_up` is a convenience, never the only alternative shown. By default the winner is trusted.

**Decisions are indexed by what they named.** A design `collab.json` may carry `"target": {"module": "ext/Source", "class": "Source"}`. The design `names` phase then asks each member for `<n>-names.json` beside its prose:

```json
{"class": "Source", "properties": ["url", "kind"], "methods": [{"name": "save", "args": ["dir"]}]}
```

When that package decision is decided, the runner appends one line per name in the winning set to the shared `public/framework/ai/collab/decisions.jsonl`:

```json
{"named": {"at": "…", "module": "ext/Source", "class": "Source", "member": "save", "kind": "method", "collab": "2026-09-28/collab-rounds/design", "decision": "d-1"}}
```

The link target is `/framework/ext/Collab/?src=/framework/ai/<collab>/collab.jsonl#d-1`. ext/Doc reads `decisions.jsonl` once and draws a ⋯ after any member name it finds there. The runner writes the record, and the doc page finds it by module and member name, so nothing depends on an AI remembering to wire a link.

`status` on a member may be `"error"` with a `why`. The `Vote` shape `{member, pick, caveat}` is shared with the check-consensus task — keep those three names.

## Added 14:50 — facts first, disputes, and abstaining (owner-words-4.md, first half)

The owner: *"there should be a systematic method for identifying, like, the simple absolute
truths … before we do this, we should do this, this, and this … those statements could also be
disputed by other agents … maybe an agent doesn't need to weigh in."*

**A `facts` phase always runs first**, before `brief`/`names` — `DEFAULT_PHASES.research` and
`.design` both start with `{ kind: "facts" }`, every other phase renumbered by one. Each member
writes `<n>-facts.json`: an array of `{id, text, certainty}` — simple, foundational truths
("always X", "never Y", "one A per B", "before X, do Y"). `certainty` is `settled` (write
"never"/"always" only for what actually breaks), `likely` (everything else), or `open` (real
disagreement). After the phase, the runner merges every member's facts by normalized text
(case/whitespace-insensitive) into one canonical list — settled only if EVERY member who listed
a fact called it settled, open if ANY member called it open, likely otherwise — and appends one
`{"fact": {id, text, certainty}}` line per merged fact. The canonical `id` is a short slug of the
fact's own text (members don't coordinate ids with each other, so a member's own id in its
`facts.json` is only for its own bookkeeping and is discarded on merge). `open` facts are named
in the NEXT phase's prompt: "Open facts to dig into: (text) (text)…".

**Any member may dispute a fact**, in any phase after `facts`, by writing `<its own dir>/dispute.json`:
`{"fact": "<fact id>", "why": "…"}`. The runner checks every active member's dir after EVERY
phase (not just `facts`), appends `{"dispute": {at, fact, member, why}}` for each one found, and
deletes the file so it is never read twice. A disputed `settled` fact drops to `likely` — a
fresh `{"fact": {...}}` line, same id (Collab.js's `on_fact` upserts by id, later line wins,
same rule as `decision`). A disputed `open` fact is untouched — it was already the least certain
there is.

**A vote may abstain.** The vote JSON a member writes may be `{"abstain": true}` instead of
`{"pick": …}` — "I have no opinion", stated explicitly, rather than read as silence. It lands in
the same `abstained` bucket as "no file" or "picked self/invalid" (so the tally's count and
`thin` flag keep working unchanged), but it ALSO gets its own `{"vote": {..., "abstain": true}}`
line — a real, deliberate answer is logged differently from one that never arrived. `Collab.Vote`
carries `abstain` (default `false`).

`node Server/collab.mjs <taskdir> --mock` writes canned facts, one canned dispute (against the
one fact every mock member calls settled), and one canned abstain vote — so this whole section
can be proven for $0.
