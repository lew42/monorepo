import { span } from "/app.js";

// The two moving cursor marks, shared by V1 (Chat.js) and v2 (ChatV2.js) so there is ONE maker and ONE
// CSS class set (law 6, review finding 4, 2026-10-25) instead of a copy in each. A caller keeps the
// returned elements (one pair per bubble/Prompt) and moves them by re-appending, never creating a second
// pair — see each caller's own place_cursors()/place_live_cursors().
/** ✓ after the newest fast chunk. */
export function cursor_el(){ return span.c("chat-cursor").el; }
/** 🧠 after the newest finished sentence. */
export function smart_cursor_el(){ return span.c("chat-smart-cursor", "🧠").el; }
