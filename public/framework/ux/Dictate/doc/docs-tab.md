# The Docs tab — this module's readme and docs, read inside the dictation sheet

**What it is.** A third tab beside AI and Debug. It shows the [readme](../readme.md) of `ux/Dictate`, rendered by the site's one markdown renderer ([ext/markdown](/framework/ext/markdown/), `md.file`), with a row of the docs a reader wants first above it: how a chat is made ([pipeline.md](pipeline.md), first), the map, the voice architecture, the wake policy, the Debug tab, settings. A click on one (or on any `.md` link inside the text) opens it in the same tab with a **← Back to the readme** button. Nothing leaves the tab.

Open it from the sheet's **More** row (Debug · Docs · Settings), the drawer's tab row, or at `<page>/ai/docs/` (for example [/framework/ext/drawer/ai/docs/](/framework/ext/drawer/ai/docs/)).

## Where it is made

- The view: `class DictateDocs` ([DictateDocs.js](../DictateDocs.js), [DictateDocs.css](../DictateDocs.css)). It catches a click on an `a[data-md]` link (the attribute `md.route` puts on every rendered `.md` link) that points inside `ux/Dictate/` and opens it in place.
- The registration (the same three lists the Debug tab is in, no second tab system): a row in `DrawerTabs.list` ([ext/drawer/tabs.js](/framework/ext/drawer/tabs.js)), a row in `AIPage.VIEWS` ([AIPage.js](/framework/ext/drawer/AIPage.js)), a link in the sheet's More row ([Sheet.js](/framework/ext/drawer/Sheet.js)), and the tab file [tabs/docs.js](/framework/ext/drawer/tabs/docs.js).
- Proof: `test/docs-tab.mjs` opens the Docs view, sees the readme's heading, opens one doc, sees its heading, goes back.

## The top of the readme

"How messages travel" is the first section of the readme, with a numbered `file:line` footnote for every claim. If you change the code it names, change the footnotes.

## The list, and what was dropped (2026-10-25)

`DictateDocs.DOCS` is ordered structure first. Dropped from it, still reachable by link: [whisper.md](whisper.md) (says Whisper is asked about every 1.5 s; the code re-sends every 900 ms, `guess_ms` in `ext/Chat/Mic.js`) and [architecture.md](architecture.md) (the "two engines" transport detail, last edited 2026-10-14; the pipeline doc and the map replace it).
