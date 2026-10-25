# ErrorLog — design (2026-10-09)

**Primary requirement.** When an error happens on a page the owner is using, the voice session (the smart/fast assistants) hears about it at once, with a snapshot of the page's state, so the two of them can work through it live. A log file alone is not enough: the error must reach a stream the session follows.

## Classes

| Class | Job | Relation |
|---|---|---|
| `ErrorLog` (`ext/ErrorLog`) | turns an error plus a state snapshot into one line and appends it | static; the one reporter on the site (law 6) |
| `FsFile` (`ext/filesystem`) | the one file API: `append()` over the dev socket | used by ErrorLog |
| `JSONL` / `live()` (`ext/JSONL`) | tails a `.jsonl` file as a stream | what a session or a page uses to follow |

No manager class yet: one static class is enough until a second kind of event needs the same path.

## The flow

1. A page calls `ErrorLog.watch(() => state)` once; `ErrorLog.report(e, ctx)` handles a caught error.
2. `FsFile.append` writes one line to `failures.jsonl` in the folder of the module that broke (`ErrorLog.module_of`: `context.module`, else the first `/framework/…` file in the stack, else the page's folder), the same file and `{at, fail:{…}}` shape `Servex/WorktreeWatch.js` writes for a failing test. A copy still goes to `ai/errors/<date>.jsonl`, the old index (since 2026-10-24; `app.js` now calls `watch()` on every page).
3. Servex `follow` delivers a new line of a followed module's `failures.jsonl` to whoever follows it, so an agent changing a module hears its errors; nothing is sent directly ([Servex/doc/follow.md](/Servex/doc/follow.md)). **Not built:** a notice in the live voice session's stream; the page watcher that re-runs a page when its files change ([page-watcher.md](./page-watcher.md)).

## Options weighed (the owner's ideas, 2026-10-09)

- **Chosen for the slice: a separate stream file, written through the one file API.** It works today, needs no new endpoint, and is a stream already.
- **Can a UI call a Servex tool?** No: MCP tools are for agents. The UI appends through `FsFile.append` (dev socket); an agent that wants to log uses the `log` tool. Both end in the same kind of file.
- **`page.log` as an Item (the owner's leading idea).** Checked: `Page` extends `Item`, `Item.Store` already replays, appends and tails one log file through `FsFile`, and `JSONL` has a `log` verb. But there is **no `page.log` today** (`Page.class.js` only has a `listing.log` local), and a page's `page.jsonl` is a content file the Page replays on load, so error lines would mix with content and need a filter. Verdict: the right end shape is a `log` Item on the page with its own store file beside `page.jsonl`, same `append` path as now. Moving to it later changes where `ErrorLog` writes, not who calls it.
- **A page property saved when set:** fits the state snapshot (the `state` callback is that), not errors, which happen outside the property.

## Spam and size

Only errors and one small state object, one line per distinct message per page load: one `failures.jsonl` per module (git-ignored), plus one index file per day. Compaction is archive, never delete: old day files move to `ai/errors/archive/`.

## Open questions

- The owner's second sentence ("have another…") and a consequence ("that would mean…") were cut off in dictation; unknown.
- Does the voice session get every error, or one notice per burst?
- Per-page error Item vs the one shared dated file: settled 2026-10-24 as neither, a per-MODULE log (`failures.jsonl`), because `follow` subscribes by folder and a builder follows the modules it changes.
