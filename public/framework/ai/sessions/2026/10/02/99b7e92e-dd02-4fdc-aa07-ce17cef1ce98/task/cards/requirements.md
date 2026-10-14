# cards — rebuild every October card's page.jsonl that the 22:36 rm -rf deleted

Load the `minion` skill first. Parent: task-mastermind-recover-main. Read the whole parent brief: [../requirements.md](../requirements.md) (its Rules are absolute and apply to you). The incident card: `public/framework/ai/sessions/2026/10/01/cards/601-untracked-files-were-deleted-from-th/`.

## The ask
At 22:36 on 2026-10-01 `rm -rf public/framework/ai/2026/10/` removed every October card. Rebuild each card's `page.jsonl` (and each sub-card's) in the exact shape Servex writes, from the recorded events, in time order. "Cards first (the owner reads them)."

## Deliverables
1. A node script `cards/rebuild-cards.mjs` (in your task dir) that reads the event sources and writes each missing card `page.jsonl`. Read how cards are written first: `Servex/agents/Layers.js` (~246), `Servex/cards*.js`, `Servex/agents/Sessions.js` (~316), and the card tools (`create_card`, `card_reply`, `card_ask`, `card_set`, `attach_card`). Sources: `public/framework/ai/board.jsonl`, `%LOCALAPPDATA%/lew42/servex/logs/cards/*.jsonl`, `%LOCALAPPDATA%/lew42/servex/logs/servex.jsonl`, the Servex agent logs `logs/agent-*.jsonl`, and the claude transcripts `C:/Users/mike/.claude/projects/C--Code-lew42-monorepo/*.jsonl` (each `mcp__servex__create_card` / `card_reply` / `card_ask` / `card_set` / `attach_card` tool_use, with its tool_result carrying the id). Owner prompts on cards (the dictation that started a card) are in Servex's prompt logs; find them. A Read-tool result or `cat` output of a card page.jsonl in a transcript is a near-exact snapshot — prefer it, then add the later events. Only events at or before 22:36:59 2026-10-01 count.
2. Every rebuilt card page.jsonl written with `fs.writeFileSync(p, s, {flag: "wx"})` (exclusive create: throws if the path appeared meanwhile; catch it and record `kept-existing`). Never write a path that exists.
3. The folder indexes: APPEND (never rewrite) the missing `{"file":"<slug>/page.jsonl"}` lines to `public/framework/ai/sessions/2026/10/01/cards/page.jsonl`, and any missing day lines to `.../2026/10/page.jsonl`, via `node .claude/hooks/append.mjs`. Keep the lines already there.
4. One line per card path in `../recovered.jsonl` through `node .claude/hooks/append.mjs ../recovered.jsonl <lines.json>`: `{"recover":{"path","source","confidence","bytes","status"}}`, with status restored | kept-existing | no-source. A card that exists now (re-created after 22:36 by its agent, e.g. line-art-from-any-image) is `kept-existing`; add `"missing_lines": N`, the count of pre-22:36 events your rebuild has that the live file lacks. Skip any path that already has a line in recovered.jsonl.
5. A headless screenshot of `http://monorepo.localhost/framework/ai/2026/10/01/` at 1920 after the rebuild (`node Server/layout-check.mjs <url> --widths 1920`, or `mcp__site__shot`; never the owner's open tabs), saved in your task dir as `cards-1920.png`. Look at it yourself: the cards are listed.

## Fence
Write only: `page.jsonl` files under `public/framework/ai/2026/10/` that do not exist, appended lines in the two index files above, and your own task dir. Every other deleted file (attachments in card folders, task dirs, skills) is the `replay` minion's; do not write those. Never run `git clean`, `checkout --`, `reset`, `stash`, or any `rm`/delete in the main tree. Commit nothing. Every node spawn sets `windowsHide: true`. Never the owner's name.

## Land
Log as you go in your task.jsonl. End with a landing line whose outcome gives the counts (computed by your script from recovered.jsonl, never typed), the screenshot, and any card you could not rebuild. Budget: about $8.
