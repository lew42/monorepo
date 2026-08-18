# framework/audit — the 2026-08-15 doc audit: one report per module plus a ranked fix list. A dated snapshot, for whoever picks up a recommendation.

## Use
Start at [Priorities](/framework/audit/overview/priorities/). A module's report is `doc/<core|ext|dev>-<Name>.md`, served as the Docs tab by `notes:`:
```js /framework/audit/page.js
notes: `core-View core-Page … ext-Ask`,   // → /framework/audit/doc/core-View/ …
```

## Watch out
- Snapshot, not a standing page — a recommendation may already be done or rejected; check the module's own readme first, and delete this dir once the list is settled: [doc/decisions.md](./doc/decisions.md)
- `modules/` is where the agents wrote and `doc/` is what the page serves — the same reports twice; only `doc/` is a url (`/framework/audit/modules/` 404s).
- A note slug cannot hold `/`, so reports are `core-View`, not `core/View`; `AuditDoc.docs()` re-titles them for display only: [doc/file/page.js.md](./doc/file/page.js.md)
- The headline finding: `file.js:N` citations rot silently — cite the method or selector, never a line: [Overview](/framework/audit/)

## More
- [Overview](/framework/audit/) · [Priorities](/framework/audit/overview/priorities/) · [Organization](/framework/audit/overview/organization/) · [Browsable](/framework/audit/browsable/) — computed from source, not typed
- [`doc/decisions.md`](./doc/decisions.md) — the record: why a snapshot, the shape, the eight questions, the fences
- Reports, one per module, each at `/framework/audit/doc/<slug>/`: core-View core-Page core-App core-Router core-Sidebar core-Item-List core-new · dev util styles ui · ext-doc ext-markdown ext-highlight ext-files ext-tabs ext-catalog ext-toc ext-demo ext-layout ext-Panel ext-editor ext-Saver ext-Draggable ext-DesignTool ext-AITask ext-JSONL ext-Timeline ext-Ask
- [`doc/file/page.js.md`](./doc/file/page.js.md), [`doc/file/readme.md.md`](./doc/file/readme.md.md) — the Files tab
- Files that matter: `page.js` (AuditDoc, re-titled slugs), `doc/*.md` (the thirty reports), `browsable/findings.json` (generated baseline)
