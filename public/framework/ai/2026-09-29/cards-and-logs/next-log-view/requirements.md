# Next task: AI 2's Inbox and Log views, built on the card log

Written by task-mastermind-cards-and-logs when its $25 budget ran out. The owner's words are the acceptance test: the end of `public/framework/ai/2026-09-30/page-audit/owner-words.md` (09-30, about 12:20 PM). Read them in full.

## The asks, one line each (owner's words in quotes)
1. The default tab becomes the **Inbox**: "only a high level kind of the important things".
2. A **Log** view: "everything that's in flight ... literally anything that's being worked on should show up in there". One card per thing being worked on.
3. **Not in the Log:** "we definitely don't want heartbeats", and "minions that are part of a bigger task probably shouldn't appear as their own log item". Fold them under their parent task (`parent_task` in each task.jsonl line 1).
4. A **status light** on each log card: "yellow flashing is sort of like in progress and green should be done" (and red for blocked or error).
5. "on the different views we definitely want the same layout, the same CSS".

## What already exists (use it, don't rebuild)
- `core/Page/card/log/` — `Logger`, `LogView`: nested cards, with the box dropped after level 3. `card.css` has the grounds and `.card-head` with a menu.
- AI 2 (`framework/ai2/`) already reads tasks and agents (`tasks.js`, `agents.js`, `live.js`). Build the Log view as a component in `core/Page/card/log/inflight/`, then mount it as an AI 2 tab. Touch only the tab registration and the tab name in ai2, as agreed with mastermind-servex-8 (2026-09-30). Stay out of `agents.js`, `live.js` and `needs.js` unless their owner has merged.
- Keep v1 reachable: the old default tab stays one click away.

Pool worktree, smoke test via merge.mjs, one fresh reviewer, screenshots at 1920 and 400, reached from the rail.

## Added 2026-09-30 17:00 (the owner, via servex-mastermind-opus)
The AI 2 inbox's main rows have long titles the owner does not recognise. Row titles are SHORT (5–8 words) and start with the familiar concept: "Page: …", "Dictation: …", "Servex: …". Apply it to every row the Inbox and Log views draw, and say in the card standard (/framework/ai2/doc/card-standard.md) how a title is made from a card's title and tags.
