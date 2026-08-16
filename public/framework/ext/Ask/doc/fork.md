# The first message forks; every later one resumes

A headless turn must never share a transcript that a human still has open in
an interactive terminal — both processes would append to the same
`.jsonl`, and the interactive session has no idea a browser turn happened
underneath it.

## The rule

The **first** browser message on a task sends `from: <the task's
session_id>`, which the server turns into `--resume <id> --fork-session`: the
new process inherits the task's entire context but writes its own transcript
under a **new** session id. That id lands in `task.jsonl` as
`chat_session_id` (`Server/plugins/Ask.js`'s `record()`, the `if (!resume)`
branch). Every later message on that same task sends `resume:
chat_session_id` instead of `from` — a plain resume of the chat's own
transcript, never touching the task's original one again.

## Where the id comes from, both times

`ext/AITask/AITask.js`'s `chat()` method picks the branch for you:
`from: m.chat_session_id ? undefined : m.session_id, resume:
m.chat_session_id`. First render, `chat_session_id` doesn't exist yet, so
`from` carries the task's own `session_id` and `resume` is `undefined` — a
fork. After that first reply, `chat_session_id` is in the manifest and every
later render resumes it directly. `chat.js`'s own `send()` closure does the
same thing across messages within one page load: `resume = r.session_id`
after every reply.

## One fork per task, forever

There is no second fork. Once `chat_session_id` exists, nothing in this
module ever forks again for that task — a chat thread is exactly one
transcript, growing by `resume`, for as long as the task exists.
