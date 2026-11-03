# Sheet step 7: the live space, `class AIFeed extends View`

Budget: $5. Sonnet. After [sheet-route](../sheet-route/requirements.md).

**What.** Step 7 of [the sheet proposal](../../../../../../../2026/10/16/voice-20261016/sheet/proposal.md), variant E's feed ([shot](../../../../../../../2026/10/16/voice-20261016/sheet/variants/e-live.html)): at split and full the body is one stream, newest at the bottom: the chat bubbles (the `ux/Dictate` widget, the one `chat.js` `GLOBAL`) plus this page's events (a task filed, a reference, a merge), read from `<page>ai/` with the `live()` tail, never a timed refresh. No All / Chat / Live switch yet (decision record in `ext/drawer/doc/owner-2026-10-16-sheet.md`).

**Done when.** Appending a line to a page's `ai/` log shows in its open sheet within about a second, at 400 and 1200; one commit through a worktree and `merge.mjs`.
