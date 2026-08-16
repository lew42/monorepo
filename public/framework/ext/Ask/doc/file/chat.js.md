One exported function, `chat(opts)`, that renders a whole panel — history,
input, streaming reply — from a single call. It's the piece every real caller
of this module actually mounts; nobody calls `ask()` directly except this
file's own `send()` closure and the two demo buttons on `page.js`.

## `bubble()` is built inside a callback, on purpose

```js
$list.append(() => { div.c("chat-turn chat-" + role, () => { … }); });
```

The comment above it names the trap directly: `$list.append(fn)`'s callback
**re-establishes the capture context**, so a bubble raised from inside an
async `send()` — which runs well after any `await` — still lands inside
`$list` instead of wherever the captor drifted to. This is the one place in
the file where the `View.captor` synchronous-capture rule (`CLAUDE.md`'s
highest-value trap) is load-bearing; every other DOM-building call in this
file happens before its first `await`.

## `resume` is a closure variable, reassigned per reply

`chat()`'s `send()` is a closure over the outer `resume` parameter — after
each successful reply, `resume = r.session_id` rewires the *next* call to
continue the same transcript. There's no state object, no re-render of the
whole panel: one variable, mutated in place, is the entire "this chat has a
session now" tracking.

## `available()` gates the whole render

If the bridge isn't there, `chat()` renders the passed-in `history` (if any)
as read-only bubbles and a muted note — never a form, never a fetch. A
module that recorded no history and has no bridge renders `.chat.flow` with
just the empty list, which is correct but easy to mistake for "broken" on a
first look; it's actually "off localhost, nothing to show."

## `Ctrl/Cmd+Enter` submits from the textarea

A native `<form>` submit handles the click path; the keydown listener on
`$input` is purely for the keyboard shortcut, and both funnel into the same
`send()` — no duplicated logic between the two entry points.

## Improvements

1. **A turn mid-flight has no cancel button.** `$send` disables during a
   request, which prevents a *second* send, but there's no way to abandon a
   slow one short of navigating away — matches the module-wide gap noted on
   [the `ask` method page](/framework/ext/Ask/api/ask/). *(medium, important
   — same root cause, one fix would cover both.)*
2. **`streamed` accumulates raw text including tool markers** (`` `tool`… ``)
   inline with prose, so a turn that calls three tools mid-reply shows three
   backtick-fenced fragments interleaved with the answer rather than a
   distinct "working…" indicator. Readable, but visually noisy on a
   tool-heavy turn. *(simple, useful.)*
3. **No maximum on `chat-list`'s rendered history** — a long-lived task with
   hundreds of chat lines renders every bubble on load. `max-height` with
   scroll (`ask.css`) hides the cost visually but not on the DOM; a virtualised
   or paginated list would matter only once a task's chat history gets long
   enough to notice, which none has yet. *(large, speculative.)*
