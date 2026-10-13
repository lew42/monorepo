# Next: make the phone sheet the sidebar's collapsed form (brief, 2026-10-13)

**Owner's design:** on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sidebar (chat plus the AI, sessions, … tabs). Findings and what is already shared: [asks.md](asks.md#2026-10-13--does-it-work-today-and-is-the-phone-sheet-the-sidebars-small-form).

**Change (one afternoon, Sonnet, in a worktree):**
1. In `ext/drawer/rail.js`, `DrawerRailSheetChat`: when the state is `full`, mount `DrawerTabs` content (the tab row and the active tab body; `tabs.js` already builds it for the desktop drawer) in the sheet instead of the `links()` buttons that call `this.close().then(() => tabs.open(tab))`.
2. The collapsed `open` state stays as it is (chat box + mic).
3. Keep the mic running across the open to full change (`start_mic` / `stop_mic`); the sheet already does so for `keep_mic`.

**Proof:** `dictate-check/mic-proof.mjs` still passes; a 400 px shot of the full state shows the tab row; 400, 1200, 1920, 3440 through `Server/layout-check.mjs`. Fence widens to `ext/drawer/**`; ask its coordinator first.

# Next 2: live bubble order, and one mic for Refine (2026-10-13)

1. **Order:** in `ext/Chat/Chat.js` (coordinate with its owner), insert a drawn bubble before the first existing bubble with a later `at`, and re-place a bubble when `retag_piece` changes its id/time. Proof: a headless run with a scripted Whisper sends four sentences with replies in between; assert DOM order equals the session file order. Replay tool: `dictate-check/replay.mjs`.
2. **One mic:** Refine's page takes its raw text from the `chat()` session instead of `VoiceStrip`'s own mic, so desktop, phone and Refine give one result. Details: [asks.md](asks.md#2026-10-13-later--bubble-order-and-how-dictate--chat--refine-nest).

# Next 3: from the surfaces page (2026-10-13)

Recommendations only, evidence in [surfaces.md](surfaces.md): measure luna vs Claude for the fast assistant (the 30-second first reply); one "New session" button; Echo and the Refine buttons share one call; retire `ext/Ask/chat.js`; trace the Dev shell chat tab.
