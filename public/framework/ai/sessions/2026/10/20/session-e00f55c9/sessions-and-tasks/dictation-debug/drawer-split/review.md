verdict: fix
1. [fix] The screenshots never reach the task folder: all ten pngs exist only in worktree qf-3, and `.gitignore:184` (`public/framework/ai/**/*.png`) ignores them, so the diff carries no proof and a fresh agent can't see the before/after. They need a force-add (`git add -f`), or the outcome should link them from a tracked place.
2. [fix] The brief asked for drawer shots at 400 **and 1200**. Only 400 exists (`before-*-400.png`, `after-*-400.png`), so the Docs round trip was never checked at 1200, where the drawer is a dock.
3. [fix] Chat v2 docs are stale now that prompts are cards. `ext/Chat/v2/readme.md:3` still says "Each Prompt sits at the root of the chat (no bubbles, no card)", and the comment at `ChatV2.css:4` says "prompts sit at its root with no bubble or card".
4. [fix] `probe.mjs:1` and `v2shot.mjs:1` import `file:///C:/Code/lew42/worktrees/qf-3/Server/Browser.mjs` and hard-code the `qf-3.localhost` host. Once the worktree goes back to the pool, both scripts break or measure the wrong tree. They should import relative to the repo and take the base from `BASE`, which `probe.mjs` already half does.
5. [note] Ask 1 is met: `after-2-back-on-ai-400.png` shows the chat running full height with no handle and no blank tab area. The cause is correct too. The hide rule moved from `@layer theme` to `@layer util` (`rail.css:399-400`) because `.flex` in util beat it. The `:not(.drawer-rail-sheet-chat-only)` rules at `rail.css:380-386` stay consistent with it.
6. [note] `.chat-v2-toggle` dropped from `min-height: 44px` to `min-height: 0` with a −.5em margin (`ChatV2.css:14`). That makes the tap target about 28 px tall, under the 44 px ui target. A 44 px box with a negative block margin of the same size would keep it tight without shrinking the target.
7. [note] `var(--card-bg, #fff)` (`ChatV2.css:7`): no `--card-bg` token is defined anywhere in `styles/`, so the colour is always a hard-coded white. An existing surface token would follow the colour scheme.
8. [note] `v2-after-400.png`: "show raw" now sits close to its card's bottom edge, so that ask is met. But the shot stops at 900 px inside the scroller, so the new padding below the last task (`padding-block-end` ×4) is not shown in any picture.

## Requirements
- 1 "on AI the chat takes 100% height" — yes — after-2-back-on-ai-400.png; session.jsonl log: tabs null, chat 844
- 1 "reproduce headless first, measure again" — yes — probe.mjs, before-/after- pngs (400 only, untracked)
- 2 "padding below the last task" — yes (code), not shown — ChatV2.css:5 padding-block-end
- 2 "cards get a background (white is fine)" — yes — v2-after-400.png
- 2 "show raw sits tight to its own card" — yes — v2-after-400.png
- "screenshots at 400 and 1200 … into this folder" — no — 1200 missing for the drawer; none tracked
- "commit by exact path; log findings in session.jsonl" — yes — commit e04e2eada, one log line
- class question — n/a
## Words
- comments and the log line are plain and say why — yes — rail.css:399 comment
- docs match the change — no — Chat v2 readme.md:3, ChatV2.css:4
