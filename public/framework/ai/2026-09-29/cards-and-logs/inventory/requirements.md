# Minion brief: the card inventory

Load the `minion` skill first. Parent: task-mastermind-cards-and-logs. Parent task dir: `public/framework/ai/2026-09-29/cards-and-logs/` (read `owner-words.md` there, the first section, in full).

## The owner's words
"use some cheap minions to fan out and look at the CSS and find anything that could be kind of identified as a card. It's essentially anything with a background, frankly."

## Work in
The worktree `C:\Code\lew42\worktrees\cards-and-logs` (branch worktree/cards-and-logs, server http://localhost:52442/). Commit there, by exact path. Never touch the main tree.

## Deliverables
1. `public/framework/core/Page/card/inventory.json` (in the worktree): an array, one object per distinct card KIND (not per instance), most-used first:
   `{name, where: "<file:line of the CSS rule or JS factory>", example_url, uses: <rough count of files/pages using it>, background, padding, radius, border, nesting: "what it sits in / what sits in it", clickable, expandable, menu, title_pattern: "none|heading|icon+title|header bar", notes}`.
   Cover at least: page previews / preview walls, `.card` in framework.css, ux/Content (Decision, Question, Quotation, Spend, Concepts tiles, Object card), AI 2 rail rows and card views (framework/ai2), sheet cards, ui/ components, /imagine/ and /layouts/ cards, ux/Tree, accordions. Grep CSS for `background` under `public/framework`, `public/imagine`, `public/layouts`; skip `core/new/`, `core/old`, `audit/`, dated `ai/<date>/` dirs.
2. Screenshots at 1920 of the 8 most-used kinds, cropped to the card (Playwright headless, `mcp__site__shot` or a script in your scratchpad; never the owner's tabs), saved to `public/framework/core/Page/card/inventory/<name>.png` in the worktree. Every process you start: `windowsHide: true`; stop anything you start.
3. `public/framework/ai/2026-09-29/cards-and-logs/inventory/findings.md` (main tree is fine for this one file, it is a log): at most 15 lines — the few distinct GROUNDS actually in use (tokens/colors), the padding values in use, how deep nesting goes today, and the worst inconsistencies.

## Not yours
Do not edit any CSS or JS. Do not create page.js. Budget ~$2.50; stop at it with what you have.
