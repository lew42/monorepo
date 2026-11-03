You are looking at ONE screenshot — a whole web page, or one region cropped out of one.

Judge ONLY what you can see in the image. Do not read any other file, do not open the
codebase, do not guess at CSS you cannot see. If the image is a region, judge the region.

Write 6–10 sentences of plain prose. Name what IN THE IMAGE drove each remark — a specific
box, edge, gap, colour or word — never a generality. Touch every angle below in at least
one clause — even a dismissal ("alignment is clean here") counts. An angle you silently
skip is a finding you silently missed:

- **layout** — is the arrangement legible? does anything sit somewhere it shouldn't?
- **spacing** — gaps too tight, too loose, or inconsistent between siblings?
- **hierarchy** — in one glance, can you tell what matters most?
- **contrast** — is any text hard to read against what is behind it?
- **alignment** — do edges line up, or is something off by a few pixels?
- **edges** — anything hard against the viewport edge or its own frame? All four sides.
- **empty space** — is a large area doing nothing?
- **missing backgrounds** — does each card/panel read as a surface, or float unframed?
- **UI/UX** — are controls obvious, labelled (or carrying a recognisable icon), reachable?
- **purpose** — what is this page FOR, and does it say so at a glance? Is what is happening
  now — the current, the active, the unfinished — the first thing the eye lands on?
- **overview & drill-down** — can you see everything at once, or only a slice? Is there an
  obvious way further in for the detail this view leaves out?
- **imagery** — do pictures and icons earn their space, or is the page all text?

Then a fenced JSON block and nothing after it:

```json
[{"class": "broken", "what": "…", "where": "…",
  "fix": {"direction": "increase", "property": "space above the h1",
          "amount": "a little", "text": "increase the space above the h1 a little"}}]
```

- `class` — `"broken"` = clearly wrong, fix it. `"maybe"` = might be better, worth a look.
  When in doubt it is a `maybe`. A taste preference is never `broken`.
- `what` — one sentence. The problem, not the fix.
- `where` — where in the image: "the top-left card", "the row of links under the heading".
- `fix` — the direction you want the thing to move, in four keys. You are pointing, not
  writing code; someone who can read the CSS translates it afterwards.
  - `direction` — exactly one of: `increase` · `decrease` · `add` · `remove` · `align` ·
    `move` · `recolour`.
  - `property` — the thing that should move, in plain words a designer would say out
    loud: `space above the h1` · `text contrast` · `column width` · `gap between cards` ·
    `surface behind the panel` · `label size`. **No CSS property names, no selectors,
    no px, no rem, no hex.**
  - `amount` — how far: `a little` · `a lot` · `to match the left side` · `to match the
    other cards`. Relative always; never a number.
  - `text` — the four words joined into one readable line, the way you would say it:
    "increase the space above the h1 a little".
  Every finding gets a `fix`. If the only honest direction is `remove`, say `remove`.

No score, no rating, no number. Finding nothing is a valid answer — return `[]`.
