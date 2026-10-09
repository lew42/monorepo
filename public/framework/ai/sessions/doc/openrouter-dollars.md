# OpenRouter dollars are real; Claude dollars are an equivalent

Two kinds of dollar appear on the Sessions page and they are never added together.

- **Claude cost** is what the tokens would cost at Claude API prices. It is a yardstick, not a bill. Field `usd`, `usd_source: "claude"`.
- **OpenRouter cost** is the dollar figure OpenRouter itself returns on each call. Servex sums it into the agent's registry row, and the indexer copies it into the session snapshot as `usd` with `usd_source: "openrouter"`. Roll-ups carry it apart as `usd_openrouter`.

A transcript has no cost field, so an OpenRouter session with no registry row has no recorded cost: `usd_source: "unrecorded"`, `usd: 0`, and the Claude-rate guess sits in `usd_estimate` where nothing adds it. Snapshots written before this field existed are `"unverified"`: their number is kept but not counted as real.

**Reconcile.** `node Server/openrouter-reconcile.mjs --write` compares the recorded total with the account figure in `ai/openrouter-usage.json` and states the gap. The Sessions page shows that line under the Claude cost.

## An unknown model is UNPRICED

`AISession.price_for(model)` used to fall back to the default model's rate for a model it had no price for, so a new model was silently billed as Sonnet. Now it returns `AISession.UNPRICED` (every rate 0, `unpriced: true`), the model is listed in `unknown_models`, and the session carries the flag "price: no rate for X (UNPRICED: counted as $0)". Add the model to `PRICES` to price it.

## Filling the real dollars from Servex's own log

`node Server/openrouter-attribute.mjs --apply` reads Servex's `%LOCALAPPDATA%/lew42/servex/logs/openrouter.jsonl` (one row per OpenRouter turn: agent name, `cost_usd`, `source`), joins each row to the session snapshot with the same `agent`, and writes the sum into that snapshot as `usd` (`usd_source: "openrouter"`). It also rebuilds the day, month and year totals. Without `--apply` it only reports. Run it again whenever you want newer rows; it is safe to repeat.

Measured 2026-10-09: 1,214 rows, $110.08, of which $106.40 joined 162 sessions and $3.68 belongs to agents with no session (listed in `openrouter-costs.json`).

**Why the log is higher than the account ($64.42).** 97% of the log ($97.72) is `key_diff`: the change in the whole key's spend during one turn, which also holds any other OpenRouter agent running at the same time, so overlapping turns are counted twice. Only `generation` ($12.15) and `reconcile` ($0.22) rows are exact. Each snapshot carries `usd_key_diff` so you can see how much of its number may overlap. The account figure is the true total; the log can only be at or above the truth for the same period, and the account also covers spend the log never saw (before 2026-09-30, other tools). The log's days are local time (`-05:00`); a session's day is its last activity in UTC, so a late-evening turn sits one day later on the page. Attribution is by agent name, so that offset moves a number between days but never between sessions.
