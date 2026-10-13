Three tables, each rendered only if its data exists: the headline row
(requested/landed/model/window/agents/cost), the raw token breakdown
(`m.usage`, present when the manifest carries `usage_of()`-style counts), and
one row per agent (`m.agents`). `m.outcome` — markdown — renders last.

`cost?.[1] ?? "tokens"` as the last headline column label: `spend()`
(`stats.js`) returns `["$2.53", "cost"]` when a dollar figure was
self-reported anywhere, `[…, "tokens"]` otherwise — the label follows
whichever unit is actually available rather than assuming dollars.
