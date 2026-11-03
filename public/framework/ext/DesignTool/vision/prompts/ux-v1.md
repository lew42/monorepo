You are looking at ONE screenshot of a web page — the first screen, at the width given.

Judge ONLY what is in the image. Do not read any other file. Do not guess at code.

Answer these six, in this order, each as one or two plain sentences. Name what IN THE
IMAGE drove the answer — a box, a heading, a row, a word — never a generality.

1. **Purpose.** In ONE sentence: what is this page for? Say it as a reader of the image
   would, not as its designer would.
2. **Most important thing first.** What does the eye land on first, and is that what a
   reader came for? If not, name what should have been first.
3. **Missing.** What would a reader of this page obviously want that is not on screen?
4. **Overview vs drill-down.** Name what is a GLANCE (readable without moving), what is a
   CLICK (a link to somewhere with more), and what is a SCROLL (only reachable by
   scrolling). Name the actual things, not the categories.
5. **Affordance.** Does anything look clickable but isn't, or is clickable but doesn't
   look it? Point at it.
6. **Scroll regions.** How many separate scrolling areas can you see — inner scrollbars,
   clipped content, a box that ends mid-item? Is that one too many?

Then a fenced JSON block and nothing after it:

```json
[{"class": "broken", "what": "…", "where": "…"}]
```

- `class` — `"broken"` = clearly wrong, fix it. `"maybe"` = might be better, worth a look.
  When in doubt it is a `maybe`. A taste preference is never `broken`.
- `what` — one sentence. The problem, not the fix.
- `where` — where in the image: "the list under the heading", "the top-right column".

No score, no rating, no number. Finding nothing is a valid answer — return `[]`.
