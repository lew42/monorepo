# The reach-through does not reach — and the thing it was for is one word

[Cluster #1 of the sweep harvest](../sweep-harvest/proposal.md) is 45 findings on 17 pages: `Page.css:96`
`.page > .wide` is a **child** combinator, and `md()`, `AITask` and `.tab-panel` each wrap content a
level down, so nothing inside them can claim `wide` and `main` caps at 40em at every width.

The brief asked for the pass-through, with a stop condition. **I stopped.** Here is why.

## Measured: the pass-through moves zero pixels

Injected on `/framework/core/Page/doc/declaring` and `/framework/ai/2026-08-17/mastermind-shots/`
at 390 / 1280 / 3440:

```css
.page > .flow          { display: grid; grid-template-columns: subgrid; grid-column: bleed; }
.page > .flow > *      { grid-column: main; min-width: 0; }
.page > .flow > .wide  { grid-column: wide; }
.page > .flow > .bleed { grid-column: bleed; }
```

`.flow` and not a new class because `md()` emits `md flow` and `AITask` emits `ai-task flow` —
core already owns that word.

| | before | subgrid | `display: contents` |
|---|---|---|---|
| declaring, table @1280 | 602px | **602px** | **602px** |
| declaring, table @3440 | 720px | **720px** | **720px** |
| mastermind-shots, tables @3440 | 720px | **720px** | **720px** |

Every number identical. `display: contents` matched the widths too and came out 40–54px shorter,
which is the wrapper's own box being lost — a regression, not a gain.

**The word was already reachable. Nothing claims it.** `md()` returns raw marked output, which has
no classes at all, so there is nothing there to say `wide` even once the track is available. And
`AITask`'s tables sit under `.ai-task > .tabs > .tab-panel` — three levels, which one pass-through
never reaches.

## The fix is one word, in a file this task may not touch

`.ai-task` is already a **direct child** of `.page`. It needs no Page.css rule at all:

```js
div.c("ai-task flow wide", …)     // AITask.js:76 — one word
```

| `/framework/ai/2026-08-17/mastermind-shots/` | before | after |
|---|---|---|
| tables @1280 | 602px | **890px** |
| tables @3440 | 720px | **2,806px** |
| page height @3440 | 5,538px | **2,425px** |

Fifty-six percent of that page's height was the 40em cap. The same measurement with the
pass-through in place and `.tabs` claiming `wide` gives the identical result — so the mechanism
works, and it is not what is missing.

## What Mike is being asked

Three edits, all outside this task's fence, none of them CSS:

1. **`ext/AITask/AITask.js:76`** — `"ai-task flow"` → `"ai-task flow wide"`. One word, the numbers above.
2. **`ext/markdown/md.js:62`** — nothing to do until a markdown table can say `wide`. Either md()
   tags wide blocks itself (a policy: "a table is not prose"), or the pass-through lands and the
   Page.css rule says which tags claim the track. Both are new policy, not a missing primitive.
3. **The pass-through itself** — land it only alongside (1) or (2). On its own it is four rules
   that change nothing, which is the definition of the cascade Mike said smells.

Everything else in [wave 3](./) landed.
