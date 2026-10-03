/* PageLog — folded into Page itself, 2026-10-03 (the owner: "fold PageLog away, so Page
   extends Item directly"). It used to be a middle class between Page and Item, adding the
   page.jsonl bits (set(), the loader, file/place/tab/settings, the listing). All of that
   now lives directly on Page (core/Page/Page.class.js) — `Page extends Item`, no stop in
   between.

   This file stays only as a compat re-export: a caller census (2026-10-03) found four
   files that still import `PageLog` by name, every one reading only a STATIC method
   (`PageLog.listing(...)`, `.loaded_listing(...)`, `.log_pages`) — never subclassing it —
   so `PageLog` can simply BE `Page` now:
     - core/Page/ext/Inbox/Inbox.js
     - ext/drawer/tabs/sessions.js
     - ai2/tasks.js
     - ai2/groups.js
   New code imports `Page` from `./Page.class.js` directly. */
export { Page as PageLog, Page as default } from "./Page.class.js";
