# asks.js — Asks Tab Design Notes

## The Asks Tab

Shows everything the owner asked for in this session as preview cards, each linked back to the sentence they said it in.

**One card is one glance:** picture of work, title, one line of what was asked, status chip, count of tasks landed.

**Level 2 (sheet, in place under card):** verbatim quote, per task: headline + decision lines from log.

**Level 3 (fold):** full landing report + remaining log lines.

This is the iceberg: what was decided at level 2, how it was done at level 3.

Data is `ext/JSONL`'s `ask` verb, written into the run's own task.jsonl.

## Design Principles

**Topic grouping:** "Combine items that are similar… remember, ah yes, that's what I asked for."
- Five labelled groups is something you navigate; 34 undifferentiated cards is a list you read.
- Topics in first-seen order (unless `rank: {list: "topics"}` says otherwise).
- "Other" is last catch-all for asks with no topic.

**Card sizing:** Owner's budget: title, one line, status, two links. Rest in the sheet below.
- One picture max: logged shot first; else first task's embedded screenshot.
- Pill labels cut at clause break (keeps identifier).
- Paths clipped from end (last 2 segments).

**Sheet layout:** One card at a time. Click open card to close (standard toggle).
- Sheet opens directly under card's row (doesn't move the card).
- Only scroll if card off-screen or on fold.

**Decision discovery:** Keyword filter to find decision lines; misses stay in fold at bottom.
- Tag `⚠`: headline must go through md() (links and inline formatting).
- Each task section shows headline + decision lines (level 2) OR full report + rest (fold).

**Task summary:** Show needed deliverables, not all tasks.
- First unreachable deliverable is a card's broken promise (404).
- Sheet below still lists everything the task logged.

## Utilities

- `card_title()` — conclusion (if weighed) or ask_title (from id).
- `ask_title()` — title from ask id: ai→AI, ui→UI, etc.
- `report_line()` — done/total tasks landed.
- `band_counts()` — landed/building/open for band heading.
- `pill_label()` — shorten to 22 chars; cut at clause break.
- `sheet_link()` — full label, CSS clips at 24em.
- `link()` — stopPropagation (card body is click target).
- `relative_to()` — rewrite task-relative paths to run-relative (fixes 404s).
- `headline()` — first line of outcome (markdown).
- `first_image()` — first screenshot in outcome.
