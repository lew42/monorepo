Every `page.js` under `framework/`, minus the ai logs and the `core/new/`
sketches — generated once by walking the filesystem, then hand-maintained.
Nothing re-derives it at runtime; `audit/page.js` imports it as a flat array
of urls to drive both the live re-measure and the saved-baseline generation
script.

## Not a `page.js` — the one file in this module a doc pass can't touch directly

This audit fenced every `.js` that isn't a `page.js`; `pages.js` is data, not
a page, so a fix here has to be a recommendation rather than an edit. See the
audit report's top item.

## It already drifted once

`ext/classdoc` was renamed to `ext/doc` on 2026-08-15. This file's own two
entries for it (`/framework/ext/classdoc/`, `/framework/ext/classdoc/overview/urls/`)
were updated to `/framework/ext/doc/` in the same pass that produced this
documentation round — but the **generated baseline**, `audit/findings.json`,
was built from the list *before* that fix and still carries 14 references to
the old urls across its rows. Regenerating the baseline is the other half of
the same fix; see `audit/findings.json.md`.

## Improvements

1. **Nothing catches a new top-level page that was never added here.** The
   file's own comment says as much ("generated once... nothing crawls at
   runtime") — every module rename or new page is silent until a click 404s
   in the audit table. This is the general form of the classdoc incident
   above, not a one-off: the same trade `ext/doc`'s own `files:` list makes,
   for the same reason (a live crawl would need `directory.json`, which is
   gitignored and blank in production). *(large, important — a real fix means
   either a build-time regeneration step or accepting the drift as a known
   cost; not something this pass can decide unilaterally. Top recommendation
   in the audit report.)*
2. **The list mixes real pages with a few that are themselves inside this
   module** (`/framework/ext/LayoutTool/`, `/framework/ext/LayoutTool/audit/`,
   `/framework/ext/LayoutTool/knowledge/`, `/framework/ext/LayoutTool/tests/`)
   — harmless (the tool measuring its own pages is a feature, per `page.js`'s
   own "measures whatever is on screen, including itself"), just worth noting
   explicitly since a reader scanning for "does this audit itself" would
   otherwise have to infer it. *(simple, speculative.)*
