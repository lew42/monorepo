# mirror-root-fix — requirements

## The ask (Mike, verbatim)

> when i click "full report" and then "show me before and after", the before and after are renders of the devbar?

Context: the DevBar `layout` section (built by layout-hunt agent A) renders LayoutTool's `report()` inside the rail. Clicking a finding's before/after (mirror.js) shows renders of the DevBar instead of the offending element.

## Hypothesis (orchestrator, unverified)

Findings carry a `:nth-child()` path from the analysis root (`.app` in the rail's case). `mirror.js` resolves that path back to the live element — if it resolves against the wrong root (document/body, or the report's own container) the walk goes astray, and since the DevBar mounts on `<body>` as a sibling of `.app`, a mis-rooted path plausibly lands on the rail. The audit page renders reports for *iframes*, so the rail (same-document, different root) is the context the seam never met.

## Scope + fence

Reproduce → root-cause → minimal fix → verify BOTH contexts (rail on a normal page; the audit page's mirror still works; tests page if it uses mirror). Owns: `ext/LayoutTool/mirror.js` + `report.js` (minimal, API stable), `dev/DevBar/layout.js` only if the fix is passing the root at the call site, and the matching `doc/file/*.md`. Nothing else; no git.
