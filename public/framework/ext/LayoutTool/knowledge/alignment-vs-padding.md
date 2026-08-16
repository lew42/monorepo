# Padding is not a misalignment

`alignment` reports edges that **nearly** line up — 3px to 12px apart — on the
theory that a wider gap is a deliberate second column and a narrower one is
sub-pixel noise. That window is also, exactly, **the site's padding scale**.

## The measurement

A padded box's children sit one padding inside its edge. Forever. By design.

```
tile         padding: 0.6em 0.8em   at 14px  →  children sit 11.2px in
message row  padding: 0.5em 0.6em   at 14px  →  children sit  8.4px in
card         padding: 1em           at 16px  →  children sit 16px in  (outside the window)
```

So every box padded between about `0.35em` and `0.85em` hands the rule a
near-miss for each of its children, against any lane its own edge is on.

## What it looks like when it fires

Two library entries, neither of which a human would call misaligned:

| entry | width | findings | every one |
|---|---|---|---|
| [Stat strip](/framework/ext/LayoutTool/library/stat-strip/) | 400 | 6 × `med/alignment` | **11.2px** — the tile's `0.8em` |
| [List and detail](/framework/ext/LayoutTool/library/list-and-detail/) | 400–3440 | 16–20 × `med/alignment` | **9.4px** — the row's `0.6em` |

**One repeated offset is the tell.** A real misalignment is one element at one
odd distance; a padding artefact is N elements at the same distance, and that
distance resolves to a round em value at the container's font size.

## The rule this suggests

Before reading an `alignment` cluster as a layout fault, take the offset and
divide it by the font size of the box the elements are inside. If it lands on a
round fraction of an em — `0.5`, `0.6`, `0.75`, `0.8` — it is that box's
padding, and the finding is the tool's.

The honest fix is in the rule, not in the layouts: an element whose offset from
a lane equals an ancestor's padding on that side is inset, not misaligned.
Until that lands, this is scored noise, and it is why
`false-positives.md`'s first run produced 987 of them.

⚠ It is **not** a reason to loosen the window. `heading-offset` is what a wider
window buys, and it only works because it narrows the *relationship* instead —
same measurement, one-tenth the noise.
