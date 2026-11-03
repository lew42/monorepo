# Log — an object-oriented logger, rendered as nested cards

Give any object its own `this.log(...)`. Wrap a method and every call it makes becomes its
own group, holding whatever it logs inside. Render the whole thing live, as nested cards —
the first three levels boxed, deeper levels just a heading at the same indentation, because a
fourth level of boxes runs out of padding to give. `../depth.js`'s `BOXED_LEVELS` is the one
place that number lives; `card/nesting/page.js` (a plain card tree, not a log) uses the same
constant, so the two nesting rules can't drift apart again. [Whisper debug log](whisper/) is
the real use: a group per transcription tick.

See it: [/framework/core/Page/card/log/](/framework/core/Page/card/log/)

## Use
```js
import Logger from "/framework/core/Page/card/log/Logger.js";
import LogView from "/framework/core/Page/card/log/LogView.js";

Logger.attach(counter);                          // counter.log(...) now works
Logger.wrap(counter, ["increment", "load"]);      // each call is its own group
counter.log.note("highlight", "done");            // a tagged line — LogView shows it caught the eye

new LogView({ logger: counter.logger });          // live cards, redraw on every entry
```
`Logger.from_jsonl(text)` reads a `Logger.JSONL` output's saved text back into the same
shape `LogView` renders — `new LogView({ entries: Logger.from_jsonl(text) })` — so a log
file on disk looks exactly like a live one. Every group carries `duration` (ms, set when it
closes) — `LogView` shows it in the toggle: "increment() · 2 lines · 3 ms".

## Watch out
- **Writing to disk is the caller's job.** `Logger.JSONL` only builds the text
  (`output.text()`); nothing in this module touches the filesystem.
- **Two log LINES in a row sit tight (0.2em); a GROUP next to anything keeps the full
  `--gap`.** If a line reads too close to its neighbour, check whether it's really a line and
  not a one-entry group — the rhythm rule only looks at the two elements' own kind.
- **Concurrent async calls on the same wrapped object can interleave their groups** —
  `Logger.wrap()` opens and closes groups on one shared stack, so two overlapping async
  calls to two different wrapped methods on the same object can nest into each other's
  groups instead of staying separate. Fine for one call at a time (the common case, and
  the demo); a page that fires several async calls on the same logged object at once
  should give each one its own `Logger` instance instead of sharing one.
- **`whisper/`'s classes carry the `log-` prefix too** (`log-whisper-*`), not a second
  namespace — the fence that reopened `styles/css-scopes.txt` only covered the one `log-`
  line, so everything under this module nests inside it rather than asking for another.

## More
- [doc/logger.md](doc/logger.md) — the full API: `Logger`, `Logger.attach`, `Logger.wrap`,
  `logger.note(tag, …)`, the three output classes, the entry shape, `LogView`'s levels.
- [page.js](page.js) — the live demo: a `Counter` object, two buttons, a JSONL read-back.
- [whisper/](whisper/) — the real use: a real `Transcriber.Whisper` against a saved clip,
  one log group per tick, a running transcript with its commit seams marked.
