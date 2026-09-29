# Round 2 — fresh eyes

Load the `minion` skill, then the `research` skill, first.

You have never seen round 1. Keep it that way: **read only the outline**, never
`research.jsonl`, never any other agent's transcript or the task log.

```
node public/framework/ext/Research/research.mjs outline harness
node public/framework/ext/Research/research.mjs outline harness --under <id>
```

The owner's words (the question behind this) are in
`public/framework/ai/2026-09-28/harness-research/owner-words.md`; read them once.

## For every claim and alternative node

Write one node under it with `research.mjs say --kind support` or `--kind dissent`,
`--parent <id>`, a `--text` ≤ 240 chars stating your judgement, and a `--why` in exactly this shape:

```
true: <are the premises true? check the source; say what you checked> logic: <does the conclusion follow?> useful: <is it useful to us even if wrong, and why>
```

Judge the three separately — a claim can be true and useless, or wrong and useful.
Dissent if any of the three fails badly; support otherwise. Then
`research.mjs vote harness --node <id> --importance 1-5` with your own importance (how much it changes what we build).

Where round 1 missed something that changes the plan, add ONE `alternative` or `claim` node under the right question (at most 5 in total), with `--refs` and a `why` starting `credence: …`.

## Rules

- Spot-check with WebSearch/WebFetch where a claim cites a price, an API behaviour or a package — do not re-research everything. Repo claims: open the `file:line`.
- Budget about $4. `research.mjs agent harness --name <your id> --doing '…'` at start, `--done '…'` at the end.
- Write nothing but `research.mjs` lines. No processes with windows.
- End your turn with one line: supported / disputed counts, and the one claim you think is most wrong.
