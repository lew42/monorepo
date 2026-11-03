# Preview/accept path — wiring proposal

## Decision: use twin.js (two iframes, not a devbar toggle)

`ext/DesignTool/audit/twin.js` already exists and already does the job:
two scaled iframes (Before / After), a live injected stylesheet in the After
frame, an Accept button that appends to `audit/accepted.css`. Nothing new to build
in the UI layer. A devbar proposals toggle would require a new UI surface and
live-reload of the main tab — more risk for the same view.

## What needs wiring (smallest path)

1. **vision browse page reads the decls** — `ext/DesignTool/vision/browse.js`
   renders each finding as a row. A finding with `sel` + `decl` (and not
   `retracted`) should call `twin(syntheticReport, shot.width)` once per shot,
   where `syntheticReport` is `{ url: shot.url, issues: [{ fix: { sel, decl }, rule: finding.what, detail: finding.why }] }`.

2. **Accept button writes `vision/accepted.css` (not audit/accepted.css)** — twin.js
   takes the QUEUE path as a param or as a default. Override it or copy twin.js's
   `accept()` to point at `ext/DesignTool/vision/accepted.css` so vision and audit
   queues don't collide.

3. **verdicts.jsonl beside the run** — on Accept, append one line:
   `{ "at": <ISO>, "url": ..., "sel": ..., "decl": ..., "what": ..., "verdict": "accepted" }`.
   Reject button appends `"verdict": "rejected"`. That file is the training signal.

## Implementation size

- browse.js change: ~15 lines (import twin, build syntheticReport, call twin per shot)
- twin.js change: 2 lines (accept QUEUE as a param, default to vision path)
- verdicts.jsonl: write in the accept/reject click handlers (~8 lines each)

Total: ~40 lines across two files.

## What it does NOT need

- No new page
- No new CSS
- No build step
- No socket change beyond the existing `write` RPC twin already uses
