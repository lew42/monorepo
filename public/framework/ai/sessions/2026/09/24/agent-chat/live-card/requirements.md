# Live card — one column, three usage bars with pace markers, honest tasks

## The owner's words (dictated, lightly cleaned up)

"This live card on the AI2 live page has a whole bunch of things: some X's, 'running now' (dispatcher idle, assistant-fast idle), then tasks (working: servex-mastermind-opus; queued: check-capture-overlap, find-missing-card-replies), then a little chat window at the bottom. I don't like these independently scrollable areas. Maybe if this area was bigger, but it's a pretty narrow column. The running-now list and the tasks list fit well in one column. The usage above also fits well in one column. But the usage should show all three, labeled 5-hour, weekly Fable and weekly all. And, as we had before, we need those on-pace indicators that sit above each bar and show where we are. Look it up: it's probably in the first AI dashboard (/framework/ai/)."

## Deliverables

1. No inner scroll areas in the Live card: usage, running now, tasks and the chat flow in one column, and the card page scrolls as one.
2. Usage shows three bars labeled "5-hour", "weekly Fable", "weekly all", each with the on-pace ▼ marker — REUSED from `ext/AITask/usage.js` (`pace()` / the `.ai-mark` meter), not rebuilt.
3. Stale "queued" tasks: they were spoken while `dispatch.off` existed; the Dispatcher never replays those (Servex/agents/Dispatcher.js line 22). Show them as "not started", with a line saying so; the ✕ still clears them.
4. The ✕s: each writes a `clear` line to `cards/live`, hiding the item until it changes again. Kept on tasks (that is how a stale task goes away); removed from "Running now" (hiding a live agent would make the list lie).

## Fence

`public/framework/ai2/live.js`, `public/framework/ai2/ai2.css`, `public/framework/ai2/page.js` (a class hook only), `public/framework/ext/AITask/usage.js` (additive only: label override / exported meter). Worktree branch `worktree/live-card`.
