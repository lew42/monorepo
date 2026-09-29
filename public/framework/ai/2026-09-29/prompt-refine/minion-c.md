# Minion C — show the ladder on the card

Load the `minion` skill first, then `page` (it brings in `content`, `layout`, `new-page`), `code` and `css`. Your task mastermind is `task-mastermind-prompt-refine`.

## The owner's words

`owner-words.md` beside this file, and ask 7 of `requirements.md`: *"Show it on a card: raw | clean | structured | brief, with the coverage table, and the dropped items highlighted."* The owner's worry is being able to ask **"wait, what did I actually say?"** beside any ask. The standing rule: *"I don't want to read things. I want to see."*

## What exists when you start

In the worktree `C:\Code\lew42\worktrees\prompt-refine`:
- `Server/refine.mjs` writes, per run dir: `raw.txt`, `clean.md` (sentences numbered `S1…`), `structured.md`, `brief.md` (asks cite `[S…]`), `coverage.md` (a row per sentence → ask / context only / dropped because…, then a flags table), `refine.json`. Doc: `Server/doc/refine.md`.
- Run dirs: `public/framework/ai/2026-09-29/prompt-refine/runs/sample/` and `runs/a|b|c/` (b has a collab run), plus `runs/<x>/ledger.md` and `audit.md` (the honest audit of the VS Code tab's relays).

## Deliverables

1. **A reusable view, `public/framework/ext/Refine/`** (module shape: `readme.md`, `page.js` that shows it on a real run, `doc/`; `Refine.js` the view). Given a run dir URL it shows:
   - **four columns side by side at 1920: raw | clean | structured | brief**, each a rung; stacked tabs on a phone;
   - click an ask in the brief (or a bullet in structured) → its cited sentences highlight in clean, and the matching stretch in raw — that is "what did I actually say?";
   - the **coverage table** below, with **dropped** rows highlighted (a warm colour, not red alarm) and **flags** (a word or strength the owner didn't use) marked;
   - a one-line state at the top: `42 sentences · 30 → asks · 9 context · 3 dropped · 2 flags`.
   - `?run=<dir>` in the URL picks the run (route everything: a reload lands in the same place).
   Use existing framework pieces (`ext/files`, `ux/Content`, tabs); check `framework.css` before any CSS; a new class goes through `new-css-class`.
2. **Put it on the card** `2026/09/29/from-dictation-to-a-brief-with-nothing-l` (its dir: `public/framework/ai/2026/09/29/from-dictation-to-a-brief-with-nothing-l/`, a `page.jsonl`). Find how other cards show a page or file (the `place` and `file` lines, `public/framework/ai2/doc/cards.md` and `card-standard.md`) and make the card open on the ladder for run `b` (the consensus dictation), with a picker for sample / a / b / c. Also show the audit's top table on the card, with dropped items highlighted. Card lines go through the worktree's copy of that dir; if cards are served only from the main tree, write the card lines via `POST http://127.0.0.1:8090/card/append?id=<id>` instead and say so.
3. **Link it from where a reader already is:** `Server/doc/refine.md` links the view; the `ext/` index names it (nothing crawls; the parent's `children:` must list it).
4. **Prove it:** load it at 1920 through the site (headless Playwright, never the owner's tabs; `ui-test` skill), click an ask, screenshot that the source highlights; one phone-width shot. Save shots in `public/framework/ai/2026-09-29/prompt-refine/shots/`. Zero console errors. Judge each shot from the picture: can a newcomer tell what was asked, what came out, and what was dropped?

## Fence

`public/framework/ext/Refine/**`, the `ext/` index page's `children:` line, `Server/doc/refine.md` (a link only), `public/framework/ai/2026/09/29/from-dictation-to-a-brief-with-nothing-l/**`, `public/framework/ai/2026-09-29/prompt-refine/shots/`. Nothing else.

## Budget, model, landing

You are Sonnet. About **$2.50**. Log to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\prompt-refine\task.jsonl` with `node .claude/hooks/append.mjs`. Commit in the worktree, don't merge. Every Node spawn sets `windowsHide: true`. End your turn with the commit hash, the shot paths, and anything left.
