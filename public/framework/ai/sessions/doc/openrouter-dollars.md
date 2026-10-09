# OpenRouter dollars are real; Claude dollars are an equivalent

Two kinds of dollar appear on the Sessions page and they are never added together.

- **Claude cost** is what the tokens would cost at Claude API prices. It is a yardstick, not a bill. Field `usd`, `usd_source: "claude"`.
- **OpenRouter cost** is the dollar figure OpenRouter itself returns on each call. Servex sums it into the agent's registry row, and the indexer copies it into the session snapshot as `usd` with `usd_source: "openrouter"`. Roll-ups carry it apart as `usd_openrouter`.

A transcript has no cost field, so an OpenRouter session with no registry row has no recorded cost: `usd_source: "unrecorded"`, `usd: 0`, and the Claude-rate guess sits in `usd_estimate` where nothing adds it. Snapshots written before this field existed are `"unverified"`: their number is kept but not counted as real.

**Reconcile.** `node Server/openrouter-reconcile.mjs --write` compares the recorded total with the account figure in `ai/openrouter-usage.json` and states the gap. The Sessions page shows that line under the Claude cost.

## An unknown model is UNPRICED

`AISession.price_for(model)` used to fall back to the default model's rate for a model it had no price for, so a new model was silently billed as Sonnet. Now it returns `AISession.UNPRICED` (every rate 0, `unpriced: true`), the model is listed in `unknown_models`, and the session carries the flag "price: no rate for X (UNPRICED: counted as $0)". Add the model to `PRICES` to price it.
