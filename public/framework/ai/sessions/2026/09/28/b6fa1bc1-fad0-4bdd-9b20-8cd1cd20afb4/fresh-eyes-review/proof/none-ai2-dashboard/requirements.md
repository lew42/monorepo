# ai2-dashboard — the owner's dashboard asks, gathered; then careful improvements

Task mastermind: `task-mastermind-ai2-dashboard`. Group: `ai-log`.

## The owner's words (verbatim)

> "Spawn a mastermind to look into the framework AI2 dashboard. One thing it should do is spawn a
> lesser minion to read through all of the last week's tasks and organize everything I've said
> about the dashboards: layout, user interface and whatnot. We don't want to clobber the
> dashboard. It's not terrible right now, so we need to be very careful about how we merge these
> updates. I had an overnight session destroy a bunch of padding on a bunch of containers the
> other day."

## Deliverables

1. **The record** — `public/framework/ai2/doc/owner-asks.md`: every owner sentence about the
   dashboards' layout and interface from 2026-09-17 … 2026-09-24, verbatim, dated, linked,
   grouped by topic, each marked done / partly done / not done against /framework/ai2/ today.
2. **The changes** — the not-done asks that are clearly wanted and don't conflict, built in a
   worktree, merged into `michael/dev` without clobbering (before/after shots of /framework/ai2/,
   /framework/ai/ and two other framework pages at 1920 and 1280).
3. ai2 readme updated (`documentation`), task landed (`finish-task`), owner-asks.md linked first.

## Fences

- Gathering minions: read-only across `public/framework/ai/`; each writes ONLY its own
  scratchpad JSON file.
- Stay out of: card storage + the card view (`task-mastermind-card-folders`), the Live card
  (`task-mastermind-live-card`). Plan sent to both before building.
