# ErrorLog architecture — one static class appends errors and state to a daily stream

ErrorLog turns an error on the page into one log line a session can follow. Entry: [`ErrorLog.js`](../ErrorLog.js). The error and a state snapshot are appended through [`FsFile`](/framework/ext/filesystem/), which writes via the dev socket, and the file is streamed to sessions that follow it.

## Static singleton, no instances

**Decided:** ErrorLog is a static class with no manager; one reporter site-wide.
**Why:** Law 6 says one of everything; the same error path works for all pages, and no state is shared between them.
**Instead:** per-page instances (each page would manage its own) or a registry of watchers (more moving parts).
**Detail:** [design — Classes](./design.md#classes)

## One file per day by ISO date

**Decided:** errors write to `/framework/ai/errors/<YYYY-MM-DD>.jsonl`, rotated at midnight.

**Changed 2026-10-24:** each error is written first to `failures.jsonl` in the module that broke, the per-module log `follow` delivers (`ErrorLog.module_of`); the day file stays as the index until its readers move ([page-watcher.md](./page-watcher.md)).
**Why:** keeps the working file small; old files move to archive; a session can tail today's file once.
**Instead:** one global file (harder to archive) or hourly splits (more files to track).
**Detail:** [design — Spam and size](./design.md#spam-and-size)

## Deduplicate by page and message

**Decided:** one line per unique (page path + error message) per page load; the same error is reported once, then silenced.
**Why:** a loop cannot flood the log; the reader sees the problem, not 1000 identical lines.
**Instead:** log every error (noise) or deduplicate globally across loads (harder to debug page lifecycle).
**Detail:** [design — Spam and size](./design.md#spam-and-size)

## State snapshot captured at error time

**Decided:** the error line includes a small state object read from a callback at the moment the error happens.
**Why:** the session sees what the page was doing when it broke, without needing a separate request.
**Instead:** save a property on Page (does not catch outside-property errors) or defer to the session (requires two log files).
**Detail:** [design — Options weighed](./design.md)

## FsFile.append, not direct writes

**Decided:** errors append through `FsFile.append()`, which writes via the dev socket (a no-op off localhost).
**Why:** it is the one file API; the same path works for UI, agents, and any other caller; writes do not tear.
**Instead:** direct `fetch()` to an endpoint (requires a server) or filesystem access (not available in the browser).
**Detail:** [design — The flow](./design.md#the-flow)

## Two listeners: error and unhandledrejection

**Decided:** `ErrorLog.watch()` installs listeners on both `window.error` (sync errors) and `unhandledrejection` (promise rejections).
**Why:** catches errors whether thrown, returned or awaited; a page that forgets a catch loses visibility.
**Instead:** errors only (misses promise rejections) or manual calls only (loses sync errors).
**Detail:** [code — watch()](/framework/ext/ErrorLog/ErrorLog.js#L40)
