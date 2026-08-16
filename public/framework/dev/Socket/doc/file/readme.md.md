The design record: four decisions with their reasoning kept, three traps, and
a `## Proposed` section of findings from an earlier every-member audit — none
of them applied, all of them still open calls.

## Why `## Proposed` and not just fixed

The audit fences on this pass forbid behaviour changes; the ones before it
apparently had the same rule, or made the same call anyway. So the readme
carries options and a recommendation rather than a diff — which means a
`## Proposed` section is only as good as the last time someone checked its
premises against the code.

## One of its premises just went stale

`### 1` opens *"The whole client → server half has no caller"* and its table
says the server-side handler is switched off at `server.js:6`. Both halves of
that claim are now false: `server.js` wires `Runtime` in, and
`FileSaver.write()`/`delete()` (`ext/Saver/FileSaver.js`) and
`LayoutTool/audit/twin.js`'s `accept()` call `async_rpc`/`rpc` for real. The
recommendation underneath (trim to `send`/`request`/`rpc`) still holds — it's
the premise, not the conclusion, that needed fixing. See
[wire](/framework/dev/Socket/docs/wire/) for the corrected accounting.

## Improvements

1. **Date-stamp `## Proposed` findings, or note what they were checked
   against.** The staleness above wasn't a writing error — the world moved
   under the doc, same day. A one-line "checked 2026-08-15" would have made
   this audit's correction a two-second confirmation instead of a grep.
   *(simple, useful.)*
2. **`### 2` (disabled defaults to undefined) and `### 3` (promise() is
   local) are both still accurate and small enough to just apply** rather
   than keep proposing. Neither needs a decision meeting. *(simple, useful —
   flagged here since docs can't apply behaviour changes; recommend outside
   this audit.)*
