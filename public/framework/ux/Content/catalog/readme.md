# Card catalog — every kind of box, drawn live

One wall of tiles, grouped by family. Each tile draws the kind by running its `render` snippet, and says its padding, whether it bleeds, and where it is used. A red mark means another kind does the same job.

## Use

- Open [`/framework/ux/Content/catalog/`](/framework/ux/Content/catalog/). The strip at the top, "Where it breaks", jumps to the worst duplicate groups.
- Click **Details** on a tile for its source files, classes, every padding it was found with, and its notes.
- The data is `catalog.json`: 101 census entries merged into 75 kinds. To fix a kind, fix the entry there.

## Watch out

- A kind with `render: null` shows why it is not drawn instead of a picture; its styles usually load only on their own page. Give it a `render` snippet and it draws.
- A snippet's own module must load: the page imports each one up front, so a broken import shows a plain "did not load" note, never a blank page.

## More

- [How the merge was done](doc/merge.md)
