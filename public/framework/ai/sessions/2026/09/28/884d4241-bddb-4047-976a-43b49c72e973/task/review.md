verdict: fix

![Element tab open, showing what a selected paragraph is and where it lives](/framework/ai/2026-09-28/page-drawer/proof/review-element-tab-1920.png)

## Fixed

1. **Six tabs, not five.** page.js:710 and readme.md:735 said five; tabs.js:932 has six (Element wraps to its own row at 3440px). Fixed: call it six, or say Element is the tab that opens on a selection.
2. **Hover stuck lit.** select.js:801 listened for `pointerleave` on `document`, which never fires there. Fixed: listen for `pointerout` with `relatedTarget === null` instead.

## Declined

3. The Element tab and click-to-select aren't in `requirements.md` — they're minion 2's own brief (owner-words-4). In the owner's spirit, but outside this review's scope.

## Noted, not blocking

4. The composer is imported, not moved — a card page shows two composers once the drawer is open. Matches the brief; worth checking the owner meant "reuse," not "relocate."
5. Selecting anything also jumps the drawer to Element, pulling the reader off AI or Sessions. Maybe just highlight, and let the reader switch tabs themselves.
6. The ☰ ships with no dev check, so it reaches the static production site too — AI tab says "No page assistant yet" there (shown above), and the `http://` page-AI call would be blocked as mixed content on https.
7. The "Ask anything…" hint stays under the chat after the first message; it should clear once one is sent.
8. The Dictation tab 404s until the dictation playground is merged — land them together.
9. Proof pngs live under `ai/**/shots/`, which `.gitignore` excludes, so those links break once the worktree is gone. Only doc/tabs.png and doc/select.png survive.
10. The fence asked for a `list_agents`/AI 2 check before touching the composer; `m1/task.jsonl` doesn't record it, though `ai2/compose.js` was edited.
11. `sheet.png` only shows the drawer shut, so this review couldn't judge the open drawer's use of space. At 3440 the ☰ sits ~2000px from the title; the page runs 61–84% empty, which comes from the Doc sheet, not this work.
12. The one-file-per-tab model and `drawer.filled_by()` are small, clear seams — no change needed. The two-line guard in `ext/layout/panel.js:1469` is a real fix outside the fence, and it's logged.
