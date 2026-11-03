# ext/JSONL: a page you leave stops streaming

Budget: $5. Sonnet, medium effort. Parent: mastermind-system-architect, who tails your `session.jsonl`: log an overview there as you go, not chat.

## The finding (verified 2026-10-20)

`ext/JSONL/live.js` uses one socket for every subscription (`Socket.singleton()`), and a path read by two views shares one server subscription. But nothing unsubscribes on navigation: `JSONL.unsubscribe()` is manual, and only 7 of 42 `live()` callers call it (in a page's `deactivated()`: `AISessionDetail`, `AITask`, `Timeline`, `TimelineTalk`, `WaitingOnYou`, `AIFeed`). The owner asked: one socket, unsubscribed on navigation.

## Build (in a worktree)

1. The smallest fix that covers all 42 callers without editing each: a stream remembers the page that was active when `live()` was called, and when the Router deactivates that page (`Router.js`, the `activated()`/`deactivated()` lifecycle), its streams are dropped through `drop()`. Coming back re-subscribes (the page's own `activated()`/render calls `live()` again; check that it does for the busiest ones: `/framework/ai/`, `/framework/ai/tasks/`, a session page). A stream started outside any page (the dev bar, the drawer) is never auto-dropped. Imports flow down: `ext/JSONL` may import from `core`, never the reverse; if core needs to announce deactivation, use an event core already has (`core/Events`), not an import of ext.
2. Prove it headless (`ui-test` skill, never the owner's tabs): open `/framework/ai/`, navigate to two other pages, and count subscriptions on the server (`Server/plugins/SocketServer/Tail.js` keeps them) before and after; show the count drops, and that going back streams again (append a line to a followed file and see it arrive).
3. Update the one line in `ext/JSONL/readme.md` (the "One socket" bullet) and `ext/JSONL/doc/live.md`.

Do not merge: your parent reviews and merges. Land with `finish-task` in your own `session.jsonl`.
