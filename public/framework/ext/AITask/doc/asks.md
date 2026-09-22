# Asks — what the owner asked for, and whether it happened

An **ask** is one thing the owner asked for, written down in their own words.
It is a line in the running session's `task.jsonl`, using
[`ext/JSONL`](/framework/ext/JSONL/)'s `ask` verb:

```json ai/2026-09-17/mastermind-layout-browser/task.jsonl
{"ask": {"id": "session-as-chat", "at": "2026-09-17T16:50:40-05:00",
  "summary": "The session log reads like a chat conversation with flow and rhythm.",
  "quote": "the session logs can even be clicked through, although that navigation …",
  "prompt": "534b8723-d1a1-4eab-a4b6-c1b3a8138351",
  "status": "building", "tasks": ["ai-log-asks"],
  "links": [{"url": "/framework/ext/AITask/", "label": "the module"}]}}
```

`summary` is one plain sentence. `quote` is what the owner actually said,
verbatim — never tidied. `prompt` is the `uuid` of the message they said it
in, so the card can link back to the real sentence in the transcript.
`tasks` are the slugs of the task dirs doing the work, in the same day.

Whoever is running the session writes these — the mastermind, or you, reading
back a long prompt. Nothing derives them; a prompt nobody wrote down as an
ask does not appear.

## The tab

When a task's log carries any asks, `AITask` puts an **Asks** tab first and
opens it by default: what the owner asked for outranks what a session did
about it. The head says what the wall is (`34 things you asked for`), and one
card per ask carries a picture of what the work produced, a title, one line, a
status chip and a link back to the prompt. That is the whole first screen.

## The wall is grouped by topic

The owner's sentence: *"combine items that are similar, at least when they
pertain to the same parent topic … so that tomorrow morning I can click through
and remember, ah yes, that's what I asked for, and now let's see what you got
for me."* Thirty-four cards in one grid is a list you read; five labelled bands
is something you navigate.

An ask's optional **`topic`** puts it in a band. The topics come out in the
order they first appear in the log — the order the owner said them — never
alphabetically. An ask with no topic joins a last band called **Other**, and a
task whose asks carry no topic at all renders **one unlabelled wall**, exactly
what it always did, so nothing changes for the archive.

Measured on the run this was built against: five bands (AI log · Layouts ·
Design system · Pages · Ask) of 13 · 7 · 7 · 6 · 1 — 34 cards for 34 asks, the
two numbers that have to agree.

**The bands themselves have an order**, dragged the same way a card is — grab
the grip on a heading — and each one shows its own `n landed · n building ·
n open`, the same three words the whole wall's own head counts in. A busy band
can also carry a **fold**, tucking its tail under "N more" so a screen of side
tangents never buries the work that outranks it. Full mechanics, the exact rank
line, and the owner's own sentence behind the fold:
[`doc/ranking.md`](/framework/ext/AITask/doc/ranking/).

⚠ **Each band is its own grid, so each band has its own detail sheet.** The
sheet slots under the clicked card's own *row*, and a row only exists inside one
grid. `close_all()` therefore sweeps every band's sheet, not just the one it was
handed — otherwise a card opened under *Layouts* stayed open when you clicked
one under *Pages*, and two sheets were on screen at once.

## Conclusions first (2026-09-18)

The owner's sentence: *"conclusions that summarize what I've been asking are
the best things to put at the top of any report… lead with the conclusion as
the title; if I'm curious I drill down and see what I asked, the conclusion,
the thought process, the references."* Once the mastermind has weighed an ask
and written down its answer as `conclusion` (one plain sentence — see
[`ext/JSONL`](/framework/ext/JSONL/doc/task-jsonl/)), that sentence **replaces**
the card's id-derived title, and the `summary` that used to sit there moves
down to the sheet, under a small **"you asked"** label — the reader meets the
answer first and the question one click down, exactly the order the sentence
above asks for. An ask with no `conclusion` yet is unchanged: id-derived
title on the card, summary right there under it.

The same line may also carry **`minutes`** — set only when reading this one
will take the owner more than a glance — and it shows as a small `~N min`
beside the status chip. Most cards say nothing there, which is the point: the
owner's own words, *"most items should read in under a minute."*

Measured on the run this was built against, at the moment it was verified:
**65 asks, 34 titled by their conclusion, 31 still by the id-derived title** —
the two numbers a card-count and a log-count agree on. That run is live and
the mastermind keeps appending to it, so this count is already stale by the
time you read it; re-derive it from the log rather than trusting the number
printed here (the same warning `doc/ranking.md`'s topic-order example carries).

## The three levels

**Level 1 — the card.** A title with a ▸ in front of it — the `conclusion`
when there is one, else the id-derived title — one clamped line, the picture,
the status, an optional `~N min`, `n of m tasks landed`, and two or three
pills. Nothing else. The triangle is the only thing on the card that says the
card opens; the cursor and the hover outline do not exist in a screenshot or
under a thumb.

**Level 2 — the sheet, in place.** Clicking a card slots a full-width sheet
into the wall **directly under that card's own row** — "you asked" and the
summary, when a conclusion moved it down here; the verbatim quote; and then,
per serving task: its name and state, the headline of what it shipped, its
deliverable pills, and the log lines that read as a decision. No new url,
nothing to navigate back from.

**Level 3 — the fold at the bottom of each task.** `the full report · 4 more
log lines` opens the task's whole landing report and every remaining line of
its log. That is the detail, and it is deliberately not on the way in.

⚠ Level 2 used to *be* level 3: it printed every serving task's full report and
every log line outright, and the three-task sheet measured **8,038px — nine
screens**. "We tend to get into too much detail too early" is the sentence this
answers; the same sheet is now 2,131px and the median is 991px.

⚠ And the sheet used to sit **after the whole wall**. Measured on all 13 cards
at 1280, the card you clicked was between 29 and 1,029px *above* the top of the
viewport by the time its detail appeared. `row_end()` finds the last card
sharing the clicked card's `offsetTop` and puts the sheet after it, so the card
does not move and the two are on one screen.

## The picture is the preview

The owner asked for the asks "listed as previews, when possible". A card takes
the newest `shot` a serving task logged; failing that, **the first image that
task embedded in its own landing report**. On the run this was built against,
no task had logged a single `shot` verb and six of seven had a screenshot in
their outcome — the whole wall was text. The picture costs about 160px a card
(the wall went 1,429 → 2,137px at 1280) and it is what makes the wall scannable.

A card with no picture un-clamps its summary line to eight lines instead of two:
cards stretch to their row, so the space goes back to the ask's own words rather
than to a hole.

## Links have to go somewhere

A task's `links` are relative to **its own** directory — a screenshot it shot, a
file it wrote — and the Asks tab draws one task's links inside *another* task's
page. `card.js`'s `route(url, m)` resolves them against the manifest's own url
(`TaskJSONL.url`); without it, four images 404'd in the sheet and forty relative
links across the archive pointed at whatever page happened to be drawing them.

A card's two or three pills are its promises, so `deliverable()` also refuses a
url the browser cannot go to (one task's only three deliverables were repo paths
like `.claude/skills/minion/SKILL.md`) and never offers a second pill to a url
the card already links to.

## The report is the card's own line

There is no separate report page. Each card says its `status` — the word the
writer claimed — next to **`n of m tasks landed`**, counted from the serving
tasks' own `landed_at`. The two can disagree, and that is the point: an ask
marked `landed` whose task never landed is exactly what the owner wants to
see. The serving manifests are fetched once when the tab builds, through the
same `directory.json` listing `dashboard.js` already warms.

## What is deliberately small

- **Which log lines are "decisions" is a keyword guess.** The sheet shows the
  first six it matches; everything it missed is in the fold below, so no line a
  task wrote is lost to a regex.
- **A title is derived from the `id`** (`ai-log-click-through` → "AI log click
  through") unless the ask carries its own `title` — or, outranking both, its
  own `conclusion`, verbatim. Short ids make good titles; that is the only
  reason ids are kebab-case words.
- **A pill's label is cut at its first clause break** ("The layout browser ·
  three walls, 99 items" → "The layout browser"), and a path is cut from the
  *front* (`.claude/skills/minion/SKILL.md` → `minion/SKILL.md`), because a
  20-character clip of a sentence names nothing you can act on. In the sheet
  there is room, so a pill keeps its whole label and the CSS clips it at 24em.
- **Several asks served by one task show the same picture.** Four of the
  thirteen here do. It is true — one piece of work answered four sentences —
  and hiding it would cost more than it saves.

## Reply to one card, and talk the wall into existence (2026-09-18)

Two controls arrived on this tab from [`ext/Ask`](/framework/ext/Ask/doc/reply/),
and both exist so the owner never has to say **which** thing they are talking
about.

**Under every ask card: reply and 🎤.** Press either and a one-line box opens
under that card. What you type or say goes to Claude with the card's own `id`,
`summary`, `quote`, `status`, `topic` and serving `tasks` already written into
the prompt — the turn opens with *"The owner is replying to ask `even-columns`:
…"* before a word of yours arrives. The answer lands under that same card a few
seconds later, and it stays there: the exchange is filed in this task's own log
as two `chat` lines carrying

```json
{"chat": {"id": "…", "at": "…", "role": "user", "text": "…", "about": {"kind": "ask", "id": "even-columns"}}}
```

`about` is what makes the thread belong to the card — a card draws the `chat`
lines whose `about.kind` and `about.id` are its own, newest last, and a `chat`
line **without** `about` is the task-wide conversation the Session tab has always
shown. Full field: [`ext/JSONL`](/framework/ext/JSONL/doc/task-jsonl/).

The same control is on every **decision** row (where it is the third thing beside
Approve and Improve — a question, a correction, a third option) and on every
**task card** on the day board, which files its reply in that task's log rather
than in this one.

**At the top of the tab: one dictate box.** Say what you want, and each thing you
name comes back as its own `ask` line — `id`, `summary` in your words, the
`quote` verbatim, a `topic`, `status: "open"` — appended to this task's log and
drawn on the wall below within seconds, with no reload. It is first on the tab
because it is what the owner came to press, and it is two small buttons tall
until it is opened.

⚠ **A reply writes into the log, so the wall can change under you.** The lines
arrive back over the socket like anybody else's and `AITask.streamed()` redraws
what changed — which is the same path a running minion's appends already take.
The card you had open stays open: the ask wall only rebuilds when the owner's
ranking or the needs-you set changes, never for a `chat` line.

## Traps met building it

- `ext/tabs` sets `--measure: none` on `.tab-panel`, because a tab's content is
  meant to fill its panel. This page borrows those classes, so a prose cap read
  from the token inside a panel resolved to `none` and did nothing at all —
  paragraphs measured 858px at 1280 with the rule matching and the browser
  reporting `max-width: none`. `ai.css` hands the measure back, scoped to
  `.ai-task`.
- A row of chips is spaced in the chips' own `em`, never `--gap`: the spacing
  clamp caps at 2.6em, so at 3440 the `gap` utility put 47px between two pills,
  no two fitted on a line, and every card grew a third chip row. `.gap` lives in
  `@layer util` and cannot be overridden from a module sheet — the class comes
  off the markup instead.
- A task's outcome headline is still **markdown**. Printed as plain text it
  showed its own source: "…on each one. [/layouts/browse/](/layouts/browse/)".
  It goes through `md()` inline, then through the same relative-url rewrite.
