The session transcript, in three layers: `feed()` (live, newest-first) above
a closed `replay()` (threaded, click-through) above nested `replay()`s for
every agent the manifest recorded.

⚠ **No `session_id` costs the entire log, silently, everywhere else** — both
`feed()` and `replay()` just `return` on a falsy id, which without this
method's own check reads as "the server can't serve it" rather than "the
manifest never recorded one." This is the one place that distinguishes the
two, with a line telling a reader that the task's first `assign` should have
carried it.
