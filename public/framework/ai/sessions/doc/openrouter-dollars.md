# OpenRouter dollars are real; Claude dollars are an equivalent

Two kinds of dollar appear on the Sessions page and they are never added together.

- **Claude cost** is what the tokens would cost at Claude API prices. It is a yardstick, not a bill. Field `usd`, `usd_source: "claude"`.
- **OpenRouter cost** is the dollar figure OpenRouter itself returns on each call. Servex sums it into the agent's registry row, and the indexer copies it into the session snapshot as `usd` with `usd_source: "openrouter"`. Roll-ups carry it apart as `usd_openrouter`.

A transcript has no cost field, so an OpenRouter session with no registry row has no recorded cost: `usd_source: "unrecorded"`, `usd: 0`, and the Claude-rate guess sits in `usd_estimate` where nothing adds it. Snapshots written before this field existed are `"unverified"`: their number is kept but not counted as real.

**Reconcile.** `node Server/openrouter-reconcile.mjs --write` compares the recorded total with the account figure in `ai/openrouter-usage.json` and states the gap. The Sessions page shows that line under the Claude cost.
