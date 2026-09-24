# How the catalog was merged

Three scouts each listed the boxes in one part of the site (101 entries in all). The same job often appeared under several names, so entries were folded:

- **Same name** in two files became one kind (`card`, `surface`, `wash`, `stat tile`).
- **Same job, different name** was folded into one kind and the old name kept in `duplicates.folded` (for example `tint` into `wash`, `ask sheet` into `ask card`, `filter chip` into `tag chip`).
- **Separate but alike** stayed separate; the twin is named in `duplicates.twins`, and the tile shows a red "duplicate of …" mark.

Each kind carries a `family`, all its `sources`, every padding found (`paddings`), and one summary `padding_rule` (`--pad-card`, `--pad`, `none`, a literal em value, or `own rule`). "Distinct padding rules" on the page counts those summaries.

`used_count` is the largest count among the folded entries, not their sum, because the scans overlap.
