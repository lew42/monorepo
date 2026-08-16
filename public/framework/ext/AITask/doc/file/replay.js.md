The transcript as browsable threads: a closed bar that fetches the transcript
on first open, groups it into per-prompt turns, and renders a rail (every
prompt, click to open) beside a detail column (that turn's full flow).

## Grouping is local, and intentionally so

`turns()`, `is_prompt()` and `load()` are not exported — `feed.js` needed the
same shape and, rather than import it, carries its own ~15-line version
tuned for incremental `ingest()` rather than one-shot batch rendering. See
that file's Improvements and the readme's Open section for when to hoist.

## Click-to-select, not link-per-thread

`select()` toggles `.active`/`.wash`/`.surface` classes by hand rather than
routing each thread to its own url — a deliberate choice (this is a
transcript viewer, not a set of pages) but it does mean a specific thread
can't be deep-linked or bookmarked the way a task or a day can.

## Improvements

1. **See `feed.js`'s Improvements #1** — the un-exported `load()`/`turns()`/
   `is_prompt()` are the other half of that duplication. *(medium, important
   — deferred by design)*
2. **No thread deep-link.** A specific turn (referenced by
   `sessionId#uuid`, which `ref()` already copies to the clipboard) can't be
   opened directly from that copied value — reading it back in requires
   scrolling the rail. Given `ref()`'s whole purpose is to hand out a
   pastable reference, closing that loop would make the reference actually
   actionable. *(medium, useful)*
