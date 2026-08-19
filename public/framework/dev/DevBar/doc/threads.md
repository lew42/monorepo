# The `ai` section — a chat is a task

```
<page>ai/<slug>/task.jsonl
```

A thread is a directory next to the page it's about, holding the same
`task.jsonl` [`ext/JSONL`](/framework/ext/JSONL/) already reads for the day
and task boards. There is no second store, no join table, no thread id that
means nothing outside this rail — **a chat is a task**, so a conversation
that happens to start here shows up anywhere else `task.jsonl` is read.

## Nothing declares a thread; the directory listing is the index

`ask.js`'s `threads()` fetches `/directory.json` (the dev server's own
listing, gitignored, dev-only) and walks it to `<page>ai/`, returning every
child directory that holds a `task.jsonl`. No manifest, no registration call
— dropping a `task.jsonl` in the right place is what makes a thread exist,
the same rule `children:` follows for pages elsewhere in the framework.

## Why a native `prompt()`

```js
const slug = slugify(window.prompt("Name this thread — one or two words"));
```

Deliberately crude. Naming a thread happens a couple of times a week, and an
inline form is a whole control surface — its own validation, its own Escape
handling, its own styles — bought for two words typed rarely. Revisit if
thread creation ever becomes a frequent action rather than an occasional one.

## The captor trap this file has to dodge

```js
div.c("dev-ai flex v", async $ai => {
    const found = await threads(url);
    $ai.append(() => panel(url, found));
});
```

`threads()` is async, and [capturing is
synchronous](/framework/core/View/doc/capturing/) — the `await` above drops
the global captor the instant it suspends. `panel(url, found)` is built
inside a **callback** passed to `$ai.append()`, which re-establishes the
captor before the callback runs, rather than being called directly after the
`await`. The same shape recurs in `panel()`'s own `show()`, one level in.

## The turn knows which tab it is, and what you selected

`chat({ context: selection })` — `context` is a **function**, called on send, so
what travels is what you had selected when you hit send, not when the box was
drawn. The server appends it to the turn's system prompt beside the tab's id, and
the turn drives that tab and no other: [ask](/framework/ext/Ask/doc/decisions/),
[wire](/framework/dev/Socket/doc/wire/).

`selection()` reads the DOM rather than importing anything — the `.focus` class a
[Panel](/framework/ext/Panel/) workspace puts on the selected panel (`panel-focus`
is the same fact as an event), `.panel-text-on` for a selected run of text, and the
plain text selection every page has for free. A page with no panels still gets the
text half; a page with neither sends nothing.

**⚠ The text selection is remembered, not read on send.** Clicking into the chat
box collapses the very selection you were about to ask about, so a
`selectionchange` listener keeps the last non-empty one. (Testing this: a range
inside a `display:none` subtree selects happily and then reads back as the empty
string — select something on screen.)

## What it remembers, and what it doesn't

`settings.threads[url]` is the one thread you were last on, *per page* — so
returning to a page reopens where you left off instead of making you
re-click. The transcript itself is never cached here: `show()` refetches
`task.jsonl` and replays it through `chat_session_id` every time a pill is
clicked, so what's on screen is always what's on disk, not a stale copy.
