# STATE — Notifications Lab (mastermind-notifications-lab)

Brief: requirements.md (same dir). Resume: read this, then continue "Next".

- **Where:** worktree `C:/Code/lew42/worktrees/notifications-lab`, branch `worktree/notifications-lab` (from michael/dev). Lab dir = `public/framework/lab/` (no lab area existed; alternative: `public/lab/`). SW = `public/sw.js`.
- **Done:** everything built + headless-tested (worker active, 8 cards, same-tag replace, maxActions truncation, push crypto roundtrip); Server/plugins/Push.js; report + phone pages; readmes. Push e2e needs real phone (headless cannot subscribe).
- **Next:** merge worktree/notifications-lab into michael/dev (merge.mjs; review gate), restart dev server for /push routes, post card note.
- **Decisions:** Lab base class `Lab` (Events + `view` from static View) in LiveView.js so every class shares one live-redraw view; no popups of tab state via timers except demo delays. Alternative: extend core/Item (heavier).
- **Open:** real Android result is the owner's; report says what is verified headless vs not.
