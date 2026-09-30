// Moved to core/Page/ext/Inbox/Inbox.js (2026-09-30): the page's inbox is now a page
// EXTENSION, not drawer-only code — core/Page/ext/readme.md says why. This file stays
// so nothing that already imports "./inbox.js" (ext/drawer/tabs.js, ext/drawer/rail.js,
// ext/drawer/tabs/ai.js) had to change.
export { default, notes, count, age, folder } from "../../core/Page/ext/Inbox/Inbox.js";
