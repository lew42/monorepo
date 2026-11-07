# /live/: one scroll area that follows new cards, between a header and a status bar

The owner's tasks on /live/ (relayed by @voice-app, 2026-11-06): `czuky0s1` "Scroll lock: content auto-follows at bottom; unlocks on scroll up; dim ↓ button lights on new item; relocks at bottom (port from chat v3)" and `in49dbif` "Layout: sticky header, ONE scroll area, sticky footer status bar (status dot moves there; tap expands to a sheet)". Branch: `worktree/live-r14`.

## Asks

- [x] **Three rows the height of the screen:** the header, ONE scroll area, a status bar. The page itself never scrolls (`.live-page` is a flex column, `.live-scroll` scrolls; [LivePage.css](/live/LivePage.css)).
- [x] **The scroll area follows new cards at the bottom, and stops when you scroll up.** Not a port: it is the chat's own lock, `sticky_scroll()` in [ext/Chat/Chat.js](/framework/ext/Chat/Chat.js), which chat v3, the ✦ sheet and the Dictate thread already use. LivePage loads it in the browser only (`follow()`), so node never imports the chat.
- [x] **A dim ↓ that lights on a new item, and relocks at the bottom.** Added to `sticky_scroll()` itself (`has-new`), so every chat gets the same button.
- [x] **The status dot moves to the bottom bar; a tap expands a sheet.** The bar shows the voice light, "Voice is driving" or "Quiet", and the delay of the last line. The sheet shows who wrote last and when, what the number means, and links to settings and removed cards (`LivePage.Status`).
- **Proof:** [shots/follow.txt](shots/follow.txt), from [shots/follow.mjs](shots/follow.mjs), at 400, 1200, 1920 and 3440 px: starts at the bottom, follows a new card, scroll up gives a dim ↓, a new card lights it, a tap goes down and follows again, and the sheet opens. Shots: `shots/follow-<width>-{start,lit,sheet}.png`. The two 404s at the end of each run are `/framework/ai/page-work.json` and `/framework/ai/tasks.json`: generated files the main tree has and a worktree does not; the same two show on any worktree page, before this change too.

## Decisions

- **Settings and a file view open at the top and never follow**: they are reference, not a feed. Alternative: follow everywhere; settings then opened at its last line.
- **LivePage owns its scroller** rather than locking the app's `.pages`: the button and the tail padding stay inside /live/. Alternative: lock `.pages`; it is shared by every page, so the state would leak across navigation.
- **Caveat:** ext/Chat's own scroll proof (`doc/proof/prove-scroll.mjs`) reports a gap of 18 px both before and after this change: it predates the 14 px breathing room, so it is stale, not broken (filed in ext/Chat improvements).
