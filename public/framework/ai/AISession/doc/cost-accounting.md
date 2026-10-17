# Cost accounting — one log, one number

The raw Claude session log is the only source of truth. Everything else (the live page, `tail.json`, `page.jsonl`, `index.json`, day snapshots) is derived and can never change the number. Reading the same log once, twice, in full or as a tail gives the same total.

## The pipeline

```
~/.claude/projects/<project>/<id>.jsonl               raw log (truth)
~/.claude/projects/<project>/<id>/subagents/*.jsonl   raw logs of in-process subagents (truth)
        |
        |  one assistant line per content block, each repeating message.usage
        v
AISessionCost.mjs   canonical node counter: Map<message id, tokens>, summed on demand
AISession.js        same rule, kept as a cached summary (cursor + state.seen); browser and index use it
AISessionAudit.mjs  separate code path that re-reads a transcript to check the others
AISessionDigest.mjs the digest's cost (same rule)
        |
        v
AISessionIndex.mjs  day / week snapshots (derived, gitignored); `--recost` and `heal()` rebuild them
```

Servex's own registry `cost` / `turn_cost` (the SDK's `total_cost_usd`) is not part of this: it is inflated and unreliable.

## The rule (one place: `AISession.merge_usage`)

1. One API message counts once, keyed by `message.id`.
2. Each token field of that message is the **largest** value any of its lines carries.
3. The set of ids seen is never trimmed (no ring).
4. Dollars are computed from tokens by code (`PRICES`); cache write 1h = 2x the input price, cache read = 0.1x.

Why a maximum: the SDK writes early lines of a message with a partial `output_tokens`, and after a compaction or resume it **replays** old messages (same ids, hundreds of lines later) with `input`, `output` and `cache_read` zeroed but the cache-write left behind. "Last line wins" lets a zeroed replay overwrite the real counts; "first line wins" keeps the partial output. A maximum survives both, and because it does not depend on order, a tail and the whole log agree.

## What was wrong

`AISession` remembered the last 40 message ids (`RING = 40`). A replayed copy whose id had already been pushed out was counted again as a new message. It was worse than a replay bug: even one in-order pass was too high on logs with SDK replays, because the replayed copies sit far from the originals.

## Before and after (same log, computed from tokens)

| Session | Before, read once | Before, replayed | After, once or replayed |
|---|---|---|---|
| `5f3ca544` | $31.045 | $62.09 | $5.802 |
| `d9427ae3` | $54.386 | $108.77 | $30.697 |

Day totals before the recost (index snapshot vs the canonical counter): 2026-10-16 $284.86 vs $278.25; 2026-10-17 $132.29 vs $82.87.

## State version

`AISession.STATE_V = 2`. A cached summary written by v1 (the ring) re-reads its log once on the next `update()`. `AISessionIndex` snapshots carry `cost_v`; `heal()` (last 3 days, on load) and `node AISessionIndex.mjs --recost [days]` rebuild stale ones.

## Check it

`node --test public/framework/ai/AISession/AISessionCost.test.mjs` feeds a real replayed log once, twice, as tail + full, in halves in both orders, and through `AISession` and the audit, plus a synthetic log with a zeroed replay.

## Confidence

High that the number is now idempotent and order-independent (tested on a real log). Moderately high that it equals the bill: it matches the audit's separate code and the token fields the API reports, but not an invoice. Open: replayed copies keep the 1h cache-write, which the maximum counts once (right if that write was real; the replay is the only copy that carries it in some logs).
