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

## What it remembers, and what it doesn't

`settings.threads[url]` is the one thread you were last on, *per page* — so
returning to a page reopens where you left off instead of making you
re-click. The transcript itself is never cached here: `show()` refetches
`task.jsonl` and replays it through `chat_session_id` every time a pill is
clicked, so what's on screen is always what's on disk, not a stale copy.
