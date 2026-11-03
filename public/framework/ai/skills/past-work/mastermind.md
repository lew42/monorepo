# past-work, the mastermind's part

You are the asker. Your job is judgment: what to search for, what the answer means. The reading goes to a Haiku worker ([worker.md](worker.md)). Context for the choices below: [context.md](/framework/ai/doc/context.md).

## 1. Split the prompt into separate searches

One owner prompt holds several asks, and each is its own search. For each ask write down:

- **The owner's sentence**, quoted, so the worker sees the real words.
- **3 to 8 search terms**, including the other names the thing might have. The trial missed because "per-file doc" is `doc/file`: the owner's words and the repo's words differ, so list both ("sidecar note", "doc/file", "about hook").
- **Likely places**: modules, `ext/` folders, the session dates.

Run `node Server/PastWork.mjs <terms>` yourself first (free, one second). Hand the worker only what the script did not settle.

## 2. Give the worker the terms, so both of you know what has been checked

Log the plan in the task folder with the `log` tool, one line per search, before you spawn:

```
log({ path: <task folder>, line: { search: { id: "s1", ask: "<the owner's sentence>", terms: ["doc/file", "per-file", "about hook"], places: ["ext/Doc", "ext/files"] } } })
```

Spawn the worker (`role: "minion"`, Haiku, low effort) with a brief that starts `Budget: $N` and contains [worker.md](worker.md) and the task folder path. The worker logs `checked` and `find` lines into the same `task.jsonl` ([worker.md](worker.md)), so you read the file, not a final report, and you see which terms are done while it still runs. Never repeat a term already logged as checked.

A search that is expected to read a lot may pass 100k tokens by a decision in the brief's `Budget:` ([agent-rules.md](/framework/ai/doc/agent-rules.md)); otherwise keep it under.

## 3. Reuse the same worker for follow-ups

When a find opens a new question ("it uses `ext/files`; who else calls it?"), send it to the **same** Haiku (`send_to_agent`), not a new one. It already holds the readmes it read, and its context is a prompt cache: a follow-up inside the cache window pays the cache-read price (Haiku 5.5: $0.01 per million, against $0.10 fresh), a new worker re-reads everything at full price ([models.md](/framework/ai/doc/models.md)). Mind the two limits:

- The cache window is minutes, not hours: send the follow-up soon, or accept a re-read.
- The worker's context grows with each follow-up. Near 100k Haiku's price per token rises 5x; once it is past about 80k, end it and start a fresh worker with a short summary of what is settled.

## 4. Read the list, then decide

Read the `find` lines (kind `exists`, `partly`, `related`, `stale`, with a confidence and where it was checked). Decide: **reuse**, **extend** (which file), or **build new and say why**. Write the decision beside the plan. If the worker found a system the owner half-remembered, name it back to the owner in their own words ("the `doc/file` notes you described").

Check one thing yourself before acting: a find marked `high` with `read in a log` and not `checked in code` is a claim about the past, not the code.
