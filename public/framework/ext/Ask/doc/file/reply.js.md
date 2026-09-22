One control, mounted under any item of a task's hierarchy: two small buttons and
a box, and under them the thread of what has already been said about that one
thing. `reply(opts)` builds it; `dictate(opts)` is the same machine set to split
a dictation into asks. The topic page is
[reply](/framework/ext/Ask/doc/reply/); this page is about the file.

## `Reply` is a class because the send is a conversation with itself

Five methods have to see the same three boxes — `$thread` (the record),
`$pending` (the exchange in flight) and `$input` — and the same `about`. A
closure would have worked and could only ever have been forked; every method
here is a seam a subclass can take over, which is exactly what
`Reply.Dictation` does with three of them (`prompt()`, `line()`, `written()`)
and nothing else.

It is attached as a **static** (`Reply.Dictation`), so it travels with the class:
importing `Reply` brings the dictation branch with it, and a subclass of `Reply`
inherits it for free (`code` §3).

## The browser is the writer, not the server

`turn_it()` calls `ask()` **without** `task`. That one omission is the whole
design: `Server/plugins/Ask.js`'s `record()` only fires when a `task` is passed,
so with it absent the server writes nothing and `record()` here writes both
`chat` lines itself, through `rpc:append`, with the `about` field only the
browser knows. Two writers for one exchange would file it twice.

The price is that the fork bookkeeping moves here too: `record()` prepends
`{"assign": {"chat_session_id": …}}` the first time, exactly as the server would
have. [fork](/framework/ext/Ask/doc/fork/) is the rule it is implementing.

## `harvest()` splits the answer from the lines it asked for

A turn answers in prose and may end with one fenced `jsonl` block. `harvest()`
returns `{answer, lines}`: the prose with the block cut out of it, and the parsed
lines. It is deliberately hostile to its own input —

- only `ask`, `decision` and `log` survive the filter;
- a line that fails `JSON.parse` is dropped, not surfaced;
- `at` is stamped **here**, from the browser's clock, never taken from the model;
- a missing `log` line is manufactured from the answer's first line.

A model that returns no block at all produces a perfectly good reply with one
`log` line, which is the failure mode you want.

## `stamp()` and `append()` are copies, on purpose

`ext/AITask/rank.js` exports the same two functions. Imports flow **down** and
`ext/AITask` imports `ext/Ask`, so `ext/Ask` may never import back — a
parent↔child cycle breaks only on a deep reload, which is the worst kind. Twelve
duplicated lines is the cheaper of the two prices, and both copies carry the
comment saying so.

## Two boxes for two kinds of bubble

`$thread` is rebuilt from `m.chats` every time the log streams a line. `$pending`
is never rebuilt — it holds the user's bubble and the answer streaming into it,
and is emptied only once the lines are filed. Without the split, an unrelated
append (another task landing, a `now` line) would wipe a half-written answer
mid-stream.

`open_threads` is a module-level `Set` of every thread on the page; `streamed()`
walks it, redraws the ones still in the document and forgets the ones that are
not. `ext/AITask`'s own `streamed()` is the only caller.

## Improvements

1. **A reply cannot be cancelled once sent** — the same gap `chat.js` has, and
   the same root cause: `Server/plugins/Ask.js` does not keep the child. *(medium,
   important — one fix covers both callers.)*
2. **The turn's instruction is one constant for every kind of item.** An ask, a
   decision and a task want subtly different things written back (a decision
   probably wants a `verdict`, which is not in the verb list at all). Splitting
   `MINION` per `kind` is a three-line change whenever that becomes the
   complaint. *(simple, speculative.)*
3. **A thread is filtered in the browser on every redraw** — `mine()` walks all
   of `m.chats` once per thread, so a task page carrying thirteen ask cards walks
   the array thirteen times per streamed line. Irrelevant at today's sizes
   (hundreds of lines), wrong at ten thousand. *(simple, speculative.)*
