Splits one user-turn transcript line into what a human actually typed versus
what the harness wrapped around it — slash-command echoes, system reminders,
task notifications — so `feed.js` and `replay.js` can show the prose and fold
the rest.

## The tag list is the whole contract

`TAG` names exactly the wrapper tags the harness is known to emit
(`local-command-caveat`, `system-reminder`, `task-notification`, …). A new
harness tag this file doesn't know about would render as raw prose instead
of a fold bar — not a crash, just a slightly noisier turn. `stats.js`'s
`HARNESS_TAG` is a deliberate, smaller, independent copy of the same idea
(see that file's notes on the mutual-import trap).

## `trivial()` is the shared "nothing happened here" test

No prose and no command — used by `feed.js`'s `finalize()` and `replay.js`'s
`render()` to drop a turn that opened on a bare harness artifact and picked
up nothing real afterward.

## Improvements

1. **`TAG` (here) and `HARNESS_TAG` (`stats.js`) list the same tag names
   twice**, deliberately, to avoid a mutual-import cycle (`stats.js` is
   imported by both `message.js`/`prompt.js`-adjacent files and can't import
   back). A shared constants-only module (no functions, so nothing to form a
   cycle around) could hold just the tag list. *(simple, useful)*
