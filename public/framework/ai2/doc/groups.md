# Groups — the rail is a few familiar names, not a stream of ids

You asked for this on 2026-09-24: "The left list of previews should primarily be GROUPS,
familiar groups. If any new thing happens, instead of becoming its own card, it gets added to
one of those groups… when I send a new prompt about system design, the System design card
should come to the top."

So the top of AI 2's rail is now seven groups, each an icon and a name, with the newest thing
that happened inside it written out in full. Everything that is not in a group yet waits below,
in a quiet fold called **Not filed yet**.

## The seven groups

| Group | What belongs in it |
|---|---|
| System design | How the agents, assistants and masterminds are organised and handed work |
| Servex | The always-on process: servers, agents, restarts, crashes, logs, the machine's health |
| AI dashboard | AI 2 and the task board: the rail, cards, the Live card, what a task cost |
| Pages & markdown | How a page is made and read: page.js, page.jsonl, markdown as pages |
| Cards & content | Card folders, kinds of card and widget, content modules |
| Layout & columns | Where things sit and how big they are: columns, layout names, spacing |
| Audits | Looking back over what was built: inventories, task audits, loose ends |

They live in one file, [`groups.json`](../groups.json): `{ id, name, icon, about, card }` each.
`about` is the sentence the fast assistant reads to decide where a prompt belongs. A new group
is one more entry there — and one more card, below.

## Each group is also a card

Every group has its own card folder (`type: "group"`, made through Servex's `POST /card/create`),
and its id is the `card` field in `groups.json`. That is what lets the fast assistant file a
prompt INTO a group: it appends the prompt to that card, the card's own assistant picks it up,
and the group rises to the top of the rail. Clicking a group opens its card, which shows every
member task's page, newest first, as sections.

## How something joins a group

One line, appended to the member itself. The latest line wins, so a thing can be moved:

```
{"group": "system-design"}
```

- **A task:** the line goes at the end of its `task.jsonl`.
  ⚠ It is NOT `assign.group`, which is the older "effort" field. `ext/JSONL`'s `TaskJSONL` does not
  know the new line yet, so a task page prints one `unknown verb "group"` warning per file; AI 2's
  own reader (`Member` in [`groups.js`](../groups.js)) catches it before any verb runs.
- **A card:** append the same line through Servex, `POST /card/append?id=<card id>`.

## How a group rises

Worked out in the page, never written into the group's log: a group's time is the newest line in
its own card or in any member, and its preview says what that newest member says — a landed
task's headline, what a running task is doing now, a card's last message,
or the words you said into the group card itself. The order changes only while the rail is quiet
(at the top, the pointer elsewhere), the same rule that keeps every other row still. The row is one update, not the whole story, so all seven groups fit the rail at 1000px tall; a group with nothing in it still shows, saying "Nothing yet."

## What the page reads

- **Tasks:** every task dir of today and yesterday with a `task.jsonl`, from the dev server's
  `directory.json`. Today's stream live; yesterday's are read once.
- **Cards:** a card's `group` line is only in its own log, so the page asks Servex for the folded
  state (`GET /card?id=`) of the group cards and of every card touched today or yesterday, once
  per change of that card's `last` time. ⚠ Filing a card does not change its `last`, so a card
  filed after the page loaded shows in its group on the next reload. The fix is one field — Servex's
  `/cards` summaries carrying `group` — which needs a Servex change and a restart.

## A card's detail is the real task page

A card that points at a task (a `task` field, or a link to `/framework/ai/<date>/<slug>/`) shows
that task's page below it, and a group card shows each member's. The page is `ext/AITask`'s own,
drawn by its static `AITask.into(base, { listing })` — the same class the task's own url draws,
never a copy. It sits OUTSIDE the box the card redraws, so a new chat line never refetches it or
closes the tab you had open; the sections are rebuilt only when the SET of members changes.

## More

- The decisions and their alternatives: [`decisions.md`](./decisions.md#groups)
- The task that built it: [`ai/2026-09-24/ai2-groups/`](/framework/ai/2026-09-24/ai2-groups/)
