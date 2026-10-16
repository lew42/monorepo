# live: a live "Today" card on /live/

The owner asked for this by voice on 2026-10-16. They removed a hand-written "today-asks" paragraph card and rejected it. They want a LIVE card that queries real session data.

## What to build
- On `/live/`, a card titled "Today" that renders a nested grid from the real data: the session index (`public/framework/ai/AISession/AISessionIndex.mjs` and its output) and each task's `task.jsonl`.
- **Each session row shows:** agent id, model, who spawned it (parent), cost, state.
- **Under each session, its tasks show:** name, state (landed / in-flight / plan-only / reverted), and a link to the task folder.
- **Links:** every name is a link, through the mention system (`ext/Mention`).
- **Keep it small.** Reuse the existing sessions dashboard code (`public/framework/ai/AISession/` and `public/framework/ai/AITask/`, e.g. AISessionRows.js, nested.js, tree.js). Do not write a parallel one.
- **Compute, don't recall:** the card reads the data at render time. It is not a pasted snapshot.

## Order of work
1. Post a title-only card first: page_add on path "/live/" with `{"type":"part-card","id":"today","title":"Today","preview":"Today","text":"Loading the live session grid…"}`.
2. Then make it live. The /live feed is `public/live/Live.js` (`Live.Card`, with preview()/full()). Pick the smallest way to have a card render a live component, for example a `type` that Live.Card maps to a renderer. Say which one you chose.

## Fence
- Edit only `public/live/`, plus a small export or helper inside `public/framework/ai/AISession/` or `AITask/` if reuse needs one.
- Never restart Servex or the dev server. Never drive the owner's browser tabs.
- Check the page headless with a Playwright shot at 400 and 1200 widths.
- Hold live reloads around write batches: `node Server/hold.mjs on/off`.
- Commit each working step, ending each message with `Co-Authored-By: Claude Sonnet <noreply@anthropic.com>`.
- Never write the owner's name.

## Report
Send one screen covering:
- what renders;
- which data source it reads;
- the commit;
- what is left.
