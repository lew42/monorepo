# AI 2 element audit (2026-09-25)

These are the pictures the audit started from (1920 wide):

- [the group card](shots/before-group-1920.png)
- [a task card](shots/before-task-1920.png)
- [Live](shots/before-live-1920.png)
- [the group card at 3440](shots/before-group-3440.png)

The page is listed top to bottom. Each element gets a verdict and the reason for it.

## The rail (left column)

| Element | What it offers | Verdict | Why |
|---|---|---|---|
| Usage strip (5-hour, weekly) | how much budget is left | **keep** | small, labelled, and it answers a real question |
| "say anything" box + Send | the way in | **keep** | it is the main action |
| `+ New card` | an empty card | **keep** | a familiar action |
| `Live` toggle button | makes Live the default view | **remove** | it looks like a link to Live, and the Live row just below already is one; Live stays the default |
| `auto-transcribe` checkbox | dictation setting | **keep** | small, and says what it does |
| `overview` · `328 cards` | the four-column overview | **keep, reword** | becomes "Overview →"; the count helps nobody |
| Live row: three thin bars | ? | **remove the bars** | three unlabelled bars mean nothing; the line under them ("3 working · 3 tasks running") says it |
| Group row: full-width black bar + `$57.54+` | how far along, and the cost | **replace** | the owner read a full bar as "complete at $57"; it becomes a short labelled bar: `▮▮▮▯ 8 of 13 done · $57 spent` |
| Card row: empty bar + `no cost yet` | nothing | **remove** | an empty bar and "no cost yet" on every row are noise; a row with nothing measured shows its title only |
| `views` `notes` `archived (16)` | other lists | **keep** | small, at the foot |

## The opened card (middle column)

| Element | What it offers | Verdict | Why |
|---|---|---|---|
| Icon + title | what this is | **keep** | the most important thing, first |
| `waiting · $57.54+` | state and spend | **keep, label** | becomes `waiting · $57.54 spent` |
| `group` dropdown | changes the card's kind | **fold into ⋯** | "group" means nothing at a glance; it moves into a `⋯` menu labelled "Change what kind of card this is" |
| `⚑` alone | flag it for the owner | **fold into ⋯** | an unlabelled icon; in the menu it reads "Flag: this is wrong" |
| `clear` | archives the card | **fold into ⋯** | "clear" what? In the menu it reads "Archive this card" |
| `Overview` / `Tasks` tabs | the outline, and the tasks list | **keep only when Tasks has tasks** | a card with no tasks shows no tab bar at all |
| "Status: 8 of 13 done." | where it stands | **keep** | the checklist below proves it |
| Delivered / Still to do | what was done, what's left | **keep** | this is the card |
| `Files and full text` fold | the folder, the raw words | **rename** | becomes "This card's files and full text (N files)", so it says what's inside |
| Raw `page.jsonl` block in about.md | how a card is stored | **fold** | the card's own text; the JSON moves under a fold |

## The chat (right column)

| Element | What it offers | Verdict | Why |
|---|---|---|---|
| Messages | what agents said | **keep** | it's the conversation |
| "talk into this card" + mic + Send | talk to it | **keep** | the main action |
| `···` and `⚙` alone | settings | **keep for now** | owned by the chat module; to be labelled in a follow-up |

## Live

| Element | Verdict | Why |
|---|---|---|
| Running now / Working on / Just landed | **keep** | the three questions Live answers, in order |
| `14 idle` fold | **keep** | detail, one click down |
| The chat under Just landed | **keep** | the conversation about what is running |
