# Lew42 v3: where content lives (proposal, 2026-11-19)

**On canvas:** the Proposal page (`16:2`), block "Proposal · Where content lives" (`35:247`). Nothing of the owner's has been moved. His words: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md) ("Text ~00:50 UTC 11-19").

## The rule

**A content master lives on the page of the smallest width it works at:**
- one-column stacks go to **Content** (they work at every size);
- two columns go to **1000 Default**;
- three or more columns, or wide layouts, go to **1920 Desktop**;
- mobile-only pieces (such as his full-width button row) go to **500 Mobile**.

Swapping content: in a 500 card, browse Content and then 500. In a 1000 section, browse Content and then 1000. In a 1920 section, browse Content, 1000 and then 1920.

## What v3 has today (read 2026-11-19)

- **Content page:** top-level frame `Content`, holding `Default Content`, `H2 Content` and `2x H2 Content` (two columns, 872 wide). They set no mode.
- **500 Mobile page:** one top-level frame, `500 Root`, holding the `500` master (it sets Scale Mobile itself and holds a Default Content instance and a button row), `500 Preview` (Scale Desktop, holding a 500 instance) and a plain `Content` frame with a full-width button row.
- **1000 Default page:** one `Content` frame of instances, no masters. **1920 Desktop:** empty.

## Verdict: the rule holds, with two fixes

- **Figma does not filter by size.** The swap menu lists every local page in page order. The order is already Content, 500, 1000, 1920, which matches the browse order, so the rule just makes the right page obvious.
- **Fix 1, folders:** only top-level frames (or slash names) make folders in the swap menu and in Assets ([Figma help](https://help.figma.com/hc/en-us/articles/360038663994), and v2 rule 30). On 500 Mobile everything sits in one `500 Root`, so it is one folder. Use the same top-level frames on every size page, **Preview, Default, Content**, instead of one Root.
- **Fix 2, names:** inside a folder called Content, the masters can drop the word: `Default`, `H2`, `2× H2`.
- **The friction is right:** the swap menu opens on the current master's folder, so one-column siblings swap in one click. `2× H2` would be one level up, on 1000 Default, and it is cramped at 500 anyway.

**Moves this proposes (not made):**
- `2x H2 Content` goes to 1000 Default › Content.
- His full-width button row becomes a master in 500 Mobile › Content.
- 1000 and 1920 each get a Preview and a Default.
