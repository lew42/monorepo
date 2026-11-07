# Rank the methods of Page and Item: core, secondary, or move out

Budget: $1. Load the `minion` skill first. Read only what is listed here.

## Why
The owner wants Page kept small and predictable while LivePage's features fold into it as plugins
(owner direction: public/framework/core/Page/doc/live-by-default.md, section "Keep Page small and predictable").
Two agents rank the same list independently; the mastermind compares them with its own ranking.

## Input
- `methods.tsv` in this folder: 196 rows, one per method (file:line, name(args), size, its leading comment). Computed by a script; do not recount.
- You may open `public/framework/core/Page/Page.class.js`, `public/framework/core/Item/Item.js`, `Item.methods.js`, `Item.life.js`, `Item.steps.js` to look at a method's body. Nothing else.

## Rank every row as one of
- `core`: the class is not itself without it (identity, the tree, set/replay, save/load, render entry, url).
- `secondary`: a real feature most pages or items use, but it could live in a helper part loaded on demand.
- `move-out`: a feature only some pages use (tabs, columns, previews, logs, inbox, words, weight, files), a compat shim, a deprecated path, or store-specific (JSONL) code. Say where it would go in 3-6 words (e.g. "plugin: tabs", "Page/Jsonl.js helper", "delete: deprecated").

## Deliverable (the only file you write)
`rank-<your model: haiku|sonnet>.tsv` in this folder, one line per input row, same order, tab-separated:
`file:line <TAB> name <TAB> core|secondary|move-out <TAB> reason or destination (under 12 words)`

Then one last line: `# counts core=N secondary=N move-out=N total=N` (total must equal 196).
No other files, no edits anywhere else, no commits. Never kill or restart the dev server, never drive browser tabs, never stash.
