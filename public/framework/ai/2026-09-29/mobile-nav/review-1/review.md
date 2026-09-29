verdict: fix

![Variants wall, now seeded with sample sentences](shots/fix-variants-wall-samples-1920.png)

1. [fix] Variant cards were blank until someone spoke — `variants/cards/page.js:20` drew an empty widget, so the wall and each page looked alike and empty. Fixed: each variant now seeds two or three sample sentences (the ▶ Sample button), so the cards show what's different on first load, as in the picture above.
2. [note] Deliverables 1–4 are all present. The sidebar-☰ fix landed earlier in commit 534858cf (`ext/drawer/drawer.css:107-109`), so it isn't in diff.patch — checked on both main and the worktree.
3. [note] All eight review screenshots were at 1280/1920/3440px, none at 400px — the width this task is about. The only mobile proof was the task's own `ext/drawer/rail/shots/*.png`.
4. [note] `ext/drawer/rail.js:140-152`'s sheet redraws the same card list `CardsDictate` already provides — a duplicate. Building it from `new CardsDictate({})` would remove that duplicate and put the variant to use.
5. [note] The sheet's plain `Dictate` (`mode: "open"`, `rail.js:141`) draws its own caption too, so a finished sentence could show twice — once as caption, once as card. Worth checking with real speech, or switching to `CardsDictate` (see 4).
6. [note] `variants/v1/page.js:18`'s "v1 — today's box" is the live base `Dictate`, not a frozen copy — it already carries this task's changes. It doesn't fully meet the "keep version 1" rule.
7. [note] If the phone rotates or widens past 52em while the sheet is open, `rail.css:59` hides it but the mic keeps listening, with no visible way to stop it.
8. [note] The sheet's slide-up transition (`rail.css:57-59`) never plays — it jumps from `display: none` straight to shown. Harmless; can be fixed or deleted.
9. [note] `Server/plugins/Whisper.js:28`'s `/whisper/inference` proxy is reachable from the LAN with no guard — fine for a dev server, but anyone on the Wi-Fi can use the GPU. Worth a line in `doc/https-lan.md`.
10. [note] `variants/compact/page.js:4`'s header comment says Compact overrides ONE method; the class and the page text both say two.
11. [note] Space: the Variants wall and each variant page were 76–86% empty at 1920/3440 — seeding samples (see 1) fills them and shows the difference at a glance. Navigation is clear: Variants has its own tab and sidebar entry, and the playground links to it.
