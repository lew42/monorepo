# Card plan — how 75 kinds of box shrink to 36

The plan for step 1 of the card consolidation, drawn live. It names eight target kinds (card, frame, region, preview, pill, row, fold, popover), says where each of the catalog's 75 kinds goes, shows every merge as a before and after pair, and lists the merges in the order to carry them out, least risky first. Nothing on the site changes until a merge is carried out.

## Use

- Open [`/framework/ux/Content/plan/`](/framework/ux/Content/plan/). The two big numbers and the eight targets are the whole idea; the pairs below them are the proof.
- The data is `plan.json`. Change a target or a kind there, then run `node public/framework/ux/Content/plan/count.mjs` from the repo root: it recounts every merge's files and pages, rebuilds the order, recomputes the two numbers, and fails if a catalog kind is missing or has two verdicts.

## Watch out

- **The three new classes exist only on this page.** `.ui-row`, `.ui-panel-body` and `.ux-popover-text` are drawn from `plan.css`, scoped to the "after" boxes. Carrying out a merge means moving each rule into the module that owns it first.
- **Page counts are what grep finds.** A shared module (the Doc well, the files browser, the tab pane) reaches more pages than the files that name its class; those merges say so under "Reach".
- **A card spaces its own children.** A box that wears `flex v gap` and moves to `.card` gets double gaps unless those words go in the same edit.

## More

- [How the plan was made](doc/method.md) — the targets, the counting, the two numbers
- [Card catalog](/framework/ux/Content/catalog/) — the 75 kinds this plan starts from
