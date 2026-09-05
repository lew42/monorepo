# Research minion — the shared brief (read with your topic's `requirements.md`)

Less is more · clarity is the exception · prioritize. Read [`minion-rules.md`](./minion-rules.md) first; everything there is mandatory. Then the `research` skill BEFORE your first entry, `new-task` (your own task dir, group `platform`), `finish-task` at the end.

## Deliverable — two files, in `public/imagine/platform/research/<topic>/`, yours alone

Write nothing else anywhere under `public/` except your task dir. The dir already holds a `log.jsonl` with one seed line: the question you are answering.

**1. `log.jsonl` — 25 to 60 entries, only ever through the writer** (never hand-written JSON):

```
node public/framework/ext/Research/entry.mjs public/imagine/platform/research/<topic>/log.jsonl \
  --kind finding --title "..." --summary "..." --url https://... --credence established
```

- `--kind` finding | source | theory | opinion | question. `--credence` established | contested | fringe | speculation — what the evidence supports, not how much you like it. If the log has no `contested` and no `speculation`, you narrated; you did not grade.
- Every `established` entry has a url. A price, limit or quota carries the url AND the date fetched, in the summary. Every number is read twice — the pricing page and the limits page must agree, or the disagreement is itself an entry.
- Title ≤ 140 chars, summary ≤ 700; the writer refuses longer. One entry, one claim.
- Your own recommendation is an `opinion` with a credence. A question you could not close is a `question` — the most useful line in the file.

**2. `verdict.md` — ONE screen, ≤ 70 lines.** It is a page the moment it exists (`/imagine/platform/research/<topic>/verdict/`), listed by the program front automatically. Shape, in this order:

1. The recommendation for the MVP, three lines.
2. The §33 record for THE one expensive-to-reverse decision in your domain, compact — *Decision · Problem · Options considered · Recommended · Why · Advantages · Disadvantages · Security · Cost · Scalability · Complexity · Migration/reversibility · Deliberately NOT doing yet.* A table or one-line sections; not prose.
3. The three numbers that matter, each with its url.
4. What to cut first if the MVP must shrink.

No essay. Cite entries by title. The owner reads this in two minutes and clicks through to the log for the evidence.

## Method

- Dig in the foreground: your own WebSearch/WebFetch. Primary sources first — vendor docs, pricing and limits pages, terms of service, statutes — then practitioner reports (dated; a 2023 blog post about a 2026 price is an `opinion`, not a `finding`).
- Read the "Start from" files in your `requirements.md` before searching — some of this was already dug on 2026-08-30 and is cited; verify and build on it, do not redo it.
- Then the skeptic pass (research skill §4) as appended entries; then `node public/framework/ext/Research/entry.mjs <your log> --check`; fix or downgrade anything flagged.
- Findings as `log` lines in your `task.jsonl` as you go, so a reader can follow live.
- Budget: aim under 250k tokens; stop digging at 60 entries. A closed question with a "nobody knows" is a complete result.
