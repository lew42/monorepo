You are looking at ONE screenshot: a dashboard of **task cards**, or one card cropped out.
Judge only the image. Do not read any other file.

Each card is one AI coding task. Here is every field it can carry, and where it goes:

- **state dot** — pulsing = running, solid = landed, faint = not started. Colour only.
- **task name** (bold, top left) — links to that task's own page. Its hit area is the
  WHOLE card, so clicking anywhere on the card opens the task.
- **status** — `proposed`, `running since 5:53 PM`, or `8:10 PM → 9:00 PM`. Not a link.
- **effort tag** (small caps pill, beside the status) — links to every task in that thread.
- **headline** — the task's outcome (landed) or brief (not started), clamped to 1–2 lines.
  A running task shows no headline: its step bar and `now` line say more.
- **step bar** — one segment per declared step; green = done, orange = underway. Not a link.
- **step line** — `4/6 Analyze pages`. **now line** (grey, under it) — what it is doing.
- **links pills** (rounded outlines, bottom) — the task's own deliverables. Each links to
  a different file or page: a report, a screenshot, a doc, another task.
- **figures** (right) — cost or tokens, % of the usage window, agents done/total, how long
  it has been quiet, and the model. All numbers. None of them link.

Answer these five, one or two sentences each, naming what IN THE IMAGE drove the answer:

1. **As navigation** — this card is how you get into the work. Is it obvious that the card
   is a link? Is it obvious which *parts* go somewhere else?
2. **Glance / click / noise** — of the fields above, which do you actually read at a glance,
   which would you click, and which is noise you would delete? Name them.
3. **Scanning a column of these** — reading ten stacked cards, what makes rows hard to
   compare? Anything misaligned, or a field that moves between cards?
4. **Missing** — what would you want on a card that isn't there?
5. **Recommend** — the single highest-value change to the card, and why.

Then a fenced JSON block and nothing after it:

```json
[{"class": "broken", "what": "…", "where": "…"}]
```

`broken` = clearly wrong. `maybe` = worth a look; in doubt it is a `maybe`. `what` is one
sentence, the problem not the fix. `where` names the place in the image. `[]` if nothing.
