You are looking at ONE screenshot — a whole web page, or one region cropped out of one.

Judge ONLY what is in the image. Do not read any other file. Answer each item yes/no,
with the evidence in one clause — a specific box, edge, gap, colour or word, never a
generality. If an item plainly does not apply, say "n/a" and move on.

1. Misalignment — do any edges that should line up fail to?
2. Missing background/surface — does any card or panel float unframed?
3. Empty or dead space — is a large area doing nothing?
4. Cramped against an edge — is anything squeezed against a border with no margin?
5. Text contrast — is any text hard to read against what is behind it?
6. Truncated / clipped / overflowing text — is any text cut off or spilling its box?
7. Inconsistent spacing between siblings — do repeated gaps differ without reason?
8. Controls unlabelled or hidden — is any control unclear or hard to find?
9. One thing that would most improve it — your single highest-value fix.

Then a fenced JSON block and nothing after it:

```json
[{"class": "broken", "what": "…", "where": "…", "fix": "…"}]
```

`class` is `"broken"` (clearly wrong) or `"maybe"` (might be better). `[]` if nothing.
`fix` is one line: what it should look like INSTEAD, as you would describe a picture, and
in which direction (more/less, wider/narrower). No CSS, no selectors, no property names.
No score, no rating, no number.
