# Session architecture — a record is its dated folder, and nothing else

`Session` is the base class for any record that is made at a moment and lives in its own folder: `<root>/YYYY/MM/DD/<slug>/` with a `page.jsonl` inside. Its main class is [`Session.js`](../Session.js) (`class Session`, the default export). It is used by [`ai/AISession`](/framework/ai/AISession/), which adds cost, cache and transcript. Read the [readme](../readme.md) first.

## One folder per session, under its day

**Decided:** a session's folder is `<root>/YYYY/MM/DD/<slug>/`, where the day comes from its first time, and the slug defaults to `session-<id8>`.
**Why:** the dated tree is the one place on disk. Browsing by day needs no index file that could drift out of sync.
**Instead:** a flat `<root>/<id>/` folder (old ones are still read, and moved into their day on first write), or a central index file (one more copy to keep correct).
**Detail:** [Session section of core/Page architecture](/framework/core/Page/doc/architecture.md)

## Subclasses own their statics

**Decided:** each subclass overrides `root_url()` and declares its own `days`, `slugs` and `scanned`.
**Why:** JavaScript statics inherit by reference. A shared map would mix two kinds of session under one id.
**Instead:** one shared map keyed by kind. Rejected for the mixing. `scan()` also checks `Object.hasOwn(this, "scanned")`, so an inherited flag is never trusted.
**Detail:** [Session.js lines 8–10 and 25](../Session.js)

## A folder names its own session, found by scanning

**Decided:** `scan()` learns which folder holds which session from the first match of: a uuid folder name, `index.json`, the `summary` in `cache.jsonl`, or the first line of `page.jsonl` (`{"session": uuid}`).
**Why:** a folder can be made first by the page tool, before any index or cache exists, so the page file itself must say whose it is.
**Instead:** a registry file that every writer must update. It drifts when a writer forgets.
**Detail:** [Session.js lines 24–38](../Session.js)

## `locate()` never makes a second folder for one session

**Decided:** `locate()` returns the folder that `scan()` already found. Failing that, it moves an old flat folder into its day. Failing that, it creates a new dated folder. A flat folder whose day is unknown is left where it is.
**Why:** two folders for one session split its log in two.
**Instead:** always create under today. That loses the real day of an old session.
**Detail:** [Session.js lines 43–58](../Session.js)

## The base class stays generic

**Decided:** `Session` knows its id, its folder and its `page.jsonl`. It has no cost, transcript or page template.
**Why:** one record class can then serve `AISession` and `RefineSession` without either one carrying the other's fields.
**Instead:** put the shared logic in `AISession`, which forces the next session kind to copy it.
**Detail:** [core/Page architecture, Session section](/framework/core/Page/doc/architecture.md)

## Not built yet: a shared `Session.Page` template

The planned design gives sessions a shared page template, `Session.Page extends Page`. It does not exist yet: `AISessionDetail` still extends `Page` directly. Treat the template as future work, not as current code.
**Detail:** [core/Page architecture](/framework/core/Page/doc/architecture.md)
