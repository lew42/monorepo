# Minion brief: wire core/Page/card in, and make its index page SHOW cards

Load `minion`, `page`, `new-page`. Parent: task-mastermind-cards-and-logs. Worktree `C:\Code\lew42\worktrees\cards-and-logs` (server http://localhost:52442/). Commit by exact path; leave the many unrelated modified files.jsonl alone.

1. `public/framework/core/Page/page.js`: add `card` to its `children:` (one entry, placed after `weight`-ish siblings; follow the file's own shape). mastermind-page has been told; touch nothing else in that file.
2. `public/framework/core/Page/readme.md`: one line under "The sub-systems": `[card](./card/) — the card system: four grounds, nesting that drops the box after level 3, header and menu patterns, cards as routed mini pages; plus [log](./card/log/), any object's own nested log`.
3. `public/framework/core/Page/card/page.js`: the index is text-first with small tile buttons and an empty screen. The owner: "show, don't tell". Make the first thing on the page a LIVE sample: one card on each of the four grounds, holding a nested card three deep, with a header bar and a ··· menu (reuse the classes in `card.css`, nothing new). Then the six children as preview cards (the site's page-preview wall, the way other index pages show children; look at `core/Page/overview/page.js` or `ux/Content/Concepts` with a bigger size). Then the one paragraph, shortened to two sentences. It must use the width at 1920 (a grid, not one narrow column).
4. Load `/framework/core/Page/`, `/framework/core/Page/card/`, `/framework/core/Page/card/log/whisper/` headless (windowsHide, stop what you start): zero console errors, zero failed requests; screenshot card/ at 1920 and 400 into this folder.
Budget ~$1.50. Log in `ai/2026-09-29/cards-and-logs/wire/task.jsonl`.
