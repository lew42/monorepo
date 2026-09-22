The session transcript, as a conversation:
`conversation()` ([Files tab](/framework/ext/AITask/files/)) for this
task's own session, then one folded conversation per agent that ran in a
session of **its own**.

An agent spawned inside this session is a sidechain of this same transcript and
is already folded into the tool runs above, so it is not listed a second time.

⚠ **No `session_id` costs the entire log, silently, everywhere else** — the
renderer just `return`s on a falsy id, which reads as "the server can't serve
it" rather than "the manifest never recorded one." This is the one place that
distinguishes the two, with a line telling a reader that the task's first
`assign` should have carried it.
