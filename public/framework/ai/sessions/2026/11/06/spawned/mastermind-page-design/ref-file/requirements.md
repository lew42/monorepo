# Live: a Ref card loads and tails a loose .jsonl

Budget: $6. Load the `minion` skill first. Card: /framework/ai/2026/11/06/live-a-ref-card-loads-and-tails-a-loose/ (the owner's words, relayed by voice-app).
Worktree: C:/Code/lew42/worktrees/pd-ref-file (branch worktree/pd-ref-file). Its server: see .worktrees.json, or `node Server/worktree-up.mjs pd-ref-file`.

## The ask (owner, via voice-app, 2026-11-06)
/live/item-test/thing.jsonl was made through the item tool (path "/live/item-test/thing.jsonl"; it built a plain Page titled "Thing"). Make it work end to end:
1. A **Ref card** in /live/item-test/'s content points at thing.jsonl. It loads it, draws it (title plus its content) and **tails** the file, so a write to thing.jsonl shows up live.
2. The route **/live/item-test/thing** (no trailing slash) opens it as a LivePage.
3. The **item tool** builds it as a LivePage, inheriting the class from its folder (`/live/item-test/page.jsonl` names `/live/LivePage.js`).
Everything automatic: ONE line adds the Ref, nothing else by hand. The page's own "solution" card proposes `{"content":{"add":{"type":"Ref","file":"thing.jsonl"}}}`.

## What exists (read these first, do not rebuild)
- `public/framework/core/Item/Ref.js` + `RefView.js` + `Ref.test.mjs`: a Ref holds `url` + `path`, resolves through `Item.open(url)` (one live root per url) and redraws on its target's change. Extend it: a `file` field resolved against the folder of the page that holds the Ref, or a relative `url`. Decide which, and log the other as the alternative.
- `Item.open` / `Store` in core/Item: check whether an opened root already tails its file (live socket). If not, that is the gap for (1).
- `public/live/LivePage.js`: its Block draws a class with its own View; the Ref must draw title plus content (a Page target), not only RefView's one row. Keep LivePage edits small and tell `mastermind-live-page` (send_to_agent) what you changed: it owns LivePage.js.
- Routing: `public/framework/core/Router/` + `listing.js`; how LivePage finds a sub-page (`LivePage.child`). (2) means a url segment `thing` with no folder, where `thing.jsonl` sits beside page.jsonl, opens that file.
- Item tool: `Servex/agents/page_tools.js` (file resolution near lines 60–170). It has a node test suite (`Servex/agents/item_tool.test.mjs`, `page_tools.test.mjs`). A Servex restart is needed for the item tool part to go live; say so, and never restart Servex yourself.

## Done means
- Headless proof (Playwright `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`) on your worktree server: /live/item-test/ shows the Ref card with "Thing" and its content. Append a line to the worktree's thing.jsonl, and the card updates within 2 s without a reload. /live/item-test/thing renders as a LivePage (`.live-page`). Save the shots and the probe output in this folder.
- An item tool test: writing to `/live/item-test/thing.jsonl` replays it as LivePage.
- Node tests green: core/Item (Item, Ref), core/List, core/Page, item_tool, page_tools. `node Server/smoke.mjs` clean on the touched pages.
- Docs current in the same commits: core/Item/readme.md (Ref), public/live/readme.md (the Showing-things table gets a "a card for a file" row).
- Commit in the worktree by exact path; findings go as `log` lines in this folder's session.jsonl via `node .claude/hooks/append.mjs` (paths are repo-relative there; the item tool wants site paths like /framework/ai/...).
- public/live/ is gitignored: `git add -f`. Do NOT add the Ref line to the main tree's /live/item-test/page.jsonl; the mastermind adds that one line after the merge.

Never: restart or kill the dev server or Servex, drive the owner's tabs, `git stash`, or merge into compliance/dev (the mastermind merges).
