# "Nothing to refine yet" with a transcript on screen (2026-10-09)

**Cause.** `RefineDemo` gave Dictate `$input: () => this.$box.el` — the raw element. Dictate reads `.el` on what it is given (`push_to_target`), so every committed sentence threw `TypeError` and never reached the box. The words showed only in Dictate's own caption. Every other caller (`ai/v/3/compose.js`, `ext/Ask/reply.js`) returns the View, not `.el`.

**Second flaw.** `go()` read the box *before* the mic had finished stopping, so even a working mic lost the last words.

**Fix.** `$input: () => this.$box`; `go()` is async, awaits `dictate.stop()`, then reads `transcript()` — the one place the demo's text comes from (box plus any unsettled guess).

**Test.** `test/nothing-to-refine.mjs <base url> [shots dir]` (needs Playwright; set `PW_ROOT` to a folder under its `node_modules`). Fails on the old code, passes on the fix, at 400 and 1920.

**Streaming later.** The owner wants Refine to stream so the processing can be watched (JSONL append + `live()` tail). Not built. `transcript()` is the single read point, so a stream can replace it without touching `go()`.

**Update 2026-10-09 (refine-dictate-ui).** The `$input` line above was still `this.$box.el` on `michael/dev`; it is now `this.$box`. `test/dictate-flow.mjs` (a spoken voice, Whisper, Refine, headless) proves the whole path. See `whisper-flow-2026-10-09.md`.
