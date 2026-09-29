# Smart scroll

The log keeps one true-or-false fact, `locked` (`talk.locked()` reads it). It starts true, which means "stay at the bottom".

- **Scrolling up unlocks it.** The box's `scroll` event sets `locked` to false only when the box moved UP since the last event. A reader who scrolled up is never moved again.
- **Reaching the bottom locks it again** (within 4px), and the next new line follows.
- **New lines follow only while locked.** After a line is drawn, the box jumps to the bottom if `locked` is true.
- **A resize of the box re-pins the bottom.** A `ResizeObserver` watches the box itself: its first layout (it is 0px tall until the page is on screen) and the composer under it growing both change its size without firing any scroll event.

## Why "only a move up" (2026-09-24)

The first version read "am I at the bottom?" on every scroll event. Our own jump to the bottom fires a scroll event one frame later, and by then the next batch of lines had already made the box taller, so the answer was "no" and the box unlocked itself. Every card opened on its oldest line. Our own jumps only ever move down, so a smaller `scrollTop` than last time is always the reader's.

## Where the lines sit

A short conversation sits at the bottom of a tall log, next to the box you type in, the way a chat app reads. That is `margin-block-start: auto` on the first line (`Chat.css`), not `justify-content: flex-end`, which would push the oldest lines above the top where no scroll can reach them.


## Merged bubbles

Messages from the same sender less than `MERGE_GAP_MS` (10 s, in `Chat.js`) apart, with no other speaker between them, draw as one bubble with one paragraph each; `mergeable()` is the whole rule. The log keeps every message separate. Every bubble is `--chat-bubble` wide (85% of the column, at most 34rem).

A `refined` line (`refine()` in `Chat.js`) replaces the raw paragraphs of the bubble holding its `of` ids; sections open in place to their `from` pieces, and clicking the bubble shows all raw pieces in time order. The card log is never rewritten.
