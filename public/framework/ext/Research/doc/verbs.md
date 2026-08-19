# The verbs

One topic = one dir = one append-only file: `public/framework/research/<slug>/research.jsonl`.
Every line is `{"<verb>": {…}}`, with `at` (ISO + local offset, from the clock) inside the value.
Append-only is the whole concurrency story — parallel minions interleave lines and never
overwrite each other.

`verbs.js` is that table as data. The CLI, the MCP tools and the page all import it, so
there is one answer to "what is a legal line" and it is code, not a prompt.

| verb | value | who | rule |
|---|---|---|---|
| `assign` | `{title, question, by, at, config:{minions,minutes}, status, summary:[…]}` | orchestrator | merges; `summary` is the report's top block — a whole array each time, ≤ 7 lines |
| `node` | `{id, parent?, kind, text, by, at, why?, refs?, icon?, img?, importance?}` | anyone | the tree. `parent` = a node id, or absent for a root |
| `vote` | `{node, by, at, importance:1–5}` | anyone | ranking, without touching the node |
| `verdict` | `{node, by, at, state, why, into?}` | orchestrator | `state` ∈ `accepted rejected parked merged`; latest wins; `merged` names `into` |
| `agent` | `{name, persona, model, at, doing, done?}` | orchestrator | the "minions running" strip; merges by `name`, so the landing line is just `{name, done}` — but a line saying neither `doing` nor `done` is refused |
| `log` | `{at, msg}` | anyone | narration: rounds, owner directions (`msg` starting `owner:`) |

## What a node may say

- `kind` ∈ `question claim evidence support dissent alternative note`.
- **`text` ≤ 240 chars, `why` ≤ 1000** — refused, never truncated. This is the
  no-walls-of-text rule, in code where a minion cannot talk its way past it.
- `support` and `dissent` **require** a `parent` and a `why`. Disagreeing without
  reasoning is noise.
- `refs` = `["Server/plugins/MCP.js:88", "https://…"]` — where it comes from.
- `icon` = a Material Symbols name (`bolt`, `warning`); `img` = a url.
- `importance` 1–5, the author's own guess.

## ids, and why they are random

`id(kind)` = the kind's first letter + 4 random base36 chars: `c7k2q` is a claim, `d…` a
dissent, `e…` evidence, `s…` support, `a…` alternative, `q…` a question, `n…` a note.
Random rather than sequential because **parallel writers must never coordinate**; the letter
means an outline reads without a legend.

The writer refuses a `parent` that is not already in the file — a node nobody can reach is
worse than a rejected write. Files are small; reading one to check is free.

## Derived, never stored

- **score** = the mean of the author's own `importance` and every `vote` on that node.
  `score(node, votes)` in `verbs.js`, so the CLI's outline and the page agree on "top".
- **verdict** = the last `verdict` line naming that node.

Both keep moving as lines arrive, which is the point of an append-only log: nothing is
edited, everything is added to.

## The API

```js
import { VERBS, KINDS, STATES, LIMITS, validate, id, line, score } from "/framework/ext/Research/verbs.js";

validate("node", value)   // null, or the one-line reason to print
id("claim")               // "c7k2q"
line("node", value)       // one JSON line, \n terminated — throws the reason
```

No DOM, no Node APIs: it runs in the browser and in `node` unchanged. Writing is
[doc/writers.md](./writers.md).
