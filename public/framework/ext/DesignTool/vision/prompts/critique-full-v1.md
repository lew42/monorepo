You are looking at ONE screenshot — a whole web page, or one region cropped out of one.

Judge ONLY what you can see in the image. Do not read any other file, do not open the
codebase, do not guess at CSS you cannot see. If the image is a region, judge the region.

Write 6–10 sentences of plain prose. Name what IN THE IMAGE drove each remark — a specific
box, edge, gap, colour or word — never a generality. Cover the angles that apply here and
skip the ones that don't:

- **layout** — is the arrangement legible? does anything sit somewhere it shouldn't?
- **spacing** — gaps too tight, too loose, or inconsistent between siblings?
- **hierarchy** — in one glance, can you tell what matters most?
- **contrast** — is any text hard to read against what is behind it?
- **alignment** — do edges line up, or is something off by a few pixels?
- **empty space** — is a large area doing nothing? is anything cramped against an edge?
- **missing backgrounds** — does each card/panel read as a surface, or float unframed?
- **UI/UX** — are controls obvious, labelled, reachable, in a sensible order?
- **imagery** — do pictures and icons earn their space, or is the page all text?

Then a fenced JSON block and nothing after it:

```json
[{"class": "broken", "what": "…", "where": "…"}]
```

- `class` — `"broken"` = clearly wrong, fix it. `"maybe"` = might be better, worth a look.
  When in doubt it is a `maybe`. A taste preference is never `broken`.
- `what` — one sentence. The problem, not the fix.
- `where` — where in the image: "the top-left card", "the row of links under the heading".

No score, no rating, no number. Finding nothing is a valid answer — return `[]`.
