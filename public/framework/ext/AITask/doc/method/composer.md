The [`ext/Ask`](/framework/ext/Ask/) chat panel — talk to this task's session
from its own page. Split out of [`chat()`](/framework/ext/AITask/api/chat/),
which is now just the fold around it: open, the composer and its replayed
history were the whole first screen of the Session tab, and the conversation
the tab is FOR began below the fold.

The first message FORKS the session — a headless turn must never share a
transcript a human still has open — and the fork's id lands in the manifest as
`chat_session_id`.
