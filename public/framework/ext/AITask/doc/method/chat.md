A **fold** around [`composer()`](/framework/ext/AITask/api/composer/), which
mounts [`ext/Ask`](/framework/ext/Ask/)'s `chat()` panel pointed at this task's
log. It is folded because open it filled the whole first screen of the Session
tab, pushing the conversation the tab is for below the fold.

`task` is `this.base()` stripped of its leading/trailing slashes  — the one path shape every Ask RPC takes
(`Server/plugins/Ask.js`'s `thread_dir()` resolves it under `public/`).

⚠ **The first message FORKS the task's own session.** A headless turn must
never share a transcript a human still has open in this exact tab, so
`resume: m.chat_session_id` (once one exists) or `from: m.session_id` (the
very first message) tells the server which session to fork *from* — the
fork's own id lands back in the manifest as `chat_session_id`, a sibling of
`session_id`, never the same value.
