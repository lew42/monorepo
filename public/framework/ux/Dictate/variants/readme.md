# Dictate variants — the same mic, a different look (or, once, a different mic)

**What:** four working `Dictate` widgets, side by side — [v1](/framework/ux/Dictate/variants/v1/)
(today's box, unchanged), [Cards](/framework/ux/Dictate/variants/cards/) (each finished
sentence becomes its own card — the mobile "prompt cards" flow),
[Compact](/framework/ux/Dictate/variants/compact/) (one short line for a toolbar), and
[Parts](/framework/ux/Dictate/variants/parts/) (the whisper half rebuilt on
[`audio/`](/framework/audio/)'s `MicStream` + rolling-window `Transcriber.Whisper`, instead of
this module's own `capture.js` + cut-and-append segments — same caption, same log, same
`revise:`). The first three are plain subclasses overriding one or two DRAWING methods; none of
them touch the mic pipeline itself — the engines, every error message, and the start sound's
real timing (fixed in `ai/2026-09-29/mobile-nav/`) are inherited for free. **Parts is different
on purpose**: it overrides the PIPELINE (`start_whisper()`, `heartbeat()`, `stop()`,
`on_level()`), not the drawing — see its own doc comment for why that's a different rule than
"never override `start()`/`stop()`" below.

**Use:** `import CardsDictate from "/framework/ux/Dictate/variants/cards/Cards.js"; new
CardsDictate({...});` — the exact same constructor shape as plain `Dictate`
(`$input`, `on_text`, `on_error`, `mode`, all still work).

## Write your own variant

Pick the ONE thing that should look different, then override the smallest method that draws
it:

- **A different container for the transcript** (a card list, a sidebar panel, …) →
  override `build_output()`. It runs inside `render()`'s own captor, so a bare factory call
  (`div.c(...)`) works exactly as it would in `render()` itself.
- **A different way of drawing a settled sentence or the live guess** → override
  `draw_caption()`. Read `this.settled_lines` (every commit, in order, both modes) and
  `this.partial_text` (the still-moving guess); write into whatever `build_output()` built.

Never override `start()`, `stop()`, or anything else in `Dictate.js` for a look-only
variant — those run the actual microphone and are the same for every variant on purpose.

## Watch out

- **`build_output()` runs ONCE, inside `render()`'s captor** — build a container there and
  keep a reference (`this.$cards = div.c(...)`); `draw_caption()` then repaints INTO that
  same reference every time, never rebuilds it.
- **`this.settled_lines` already exists on the base class**, pushed by `commit()` in BOTH
  modes — a variant never needs its own bookkeeping just to get "every sentence, in order".

## More

- [`Dictate`](/framework/ux/Dictate/) — the class every variant extends
- [Playground](/framework/ux/Dictate/playground/) — the full raw/corrections/live pipeline,
  built on plain `Dictate`
