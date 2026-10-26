# Session switcher in the dictate widget (also the mobile sheet)

Item 4 of [dictation-debug/handoff.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/handoff.md) (commit 2977943e5), asked 2026-10-25 in voice session [v-9dvbbrn](/framework/ai/sessions/2026/10/25/v-9dvbbrn/), relayed by session-smart-v-9dvbbrn. Build only this item.

## The owner's asks

- [x] One control instead of the "New session" button: a dropdown of recent sessions to switch to, and a plus to start a new one. Proof: `session_switcher` in `ux/Dictate/chat.js`, used by the drawer tab and the phone sheet.
- [x] Short label per entry. Proof: `row.title ?? row.session`.
- [x] Plus placement: a button beside the list (the owner left it open). Proof: `+ New session` button in `session_switcher`.
- [x] Titles come from each session's `index.json` / `session.summary.json`, via `Session.recent_project()`.

## What exists already (past-work)

`ext/drawer/tabs/ai.js` (the desktop drawer's AI tab) already had its own hand-rolled "+ New session" + "Switch session ▾" + list, built 2026-10-02. The phone sheet's head (`ext/drawer/Sheet.js`) had only the bare New session button — the confirmed gap, and the one the owner actually hit (the voice session's `host` field is a phone IP).

## What was built

```
ux/Dictate/chat.js        session_switcher(mount, opts): the one shared control (keep: true mounts only)
ext/drawer/tabs/ai.js     calls it (its own copy removed)
ext/drawer/Sheet.js       phone sheet head calls it
ext/drawer/drawer.css     styles .drawer and .drawer-rail-sheet together
ux/Dictate/page.js        unchanged: private demo keeps new_session_button()
```

Worktree `worktree/session-switcher`, reviewed (`Server/review.mjs`), landed via `Server/merge.mjs`.
