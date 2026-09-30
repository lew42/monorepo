# Asks

Every ask the owner made, who owns it, and whether it landed — the answer to "a lot of tasks
are getting kind of left in limbo" (the owner, 2026-09-30). The live page is
[`/framework/ai/asks/`](/framework/ai/asks/); this folder is its code.

## What

- [`fold.js`](fold.js) — the ledger's own reading, `ask_id(ask)` and `fold_asks(lines)`. Pure
  (no DOM, no Servex): it runs straight in the browser (this page, `ai2/needs.js`'s Needs you
  tab) and in node (`Servex/asks/Asks.js`). **The one vocabulary — never hand-roll a fold.**
- [`page.js`](page.js) — the ledger's page: a count strip (Stalled · Building · Routed ·
  Landed · Dropped, click one to filter — the url is `?status=<word>`), then each group as its
  own column, newest first, stalled first. A row: its title, owner, age, a link to its card
  and to its own words, and its history folded under a "N updates" disclosure.
- The ledger file itself, `public/framework/ai/asks.jsonl`, and the code that writes and
  watches it, are in `Servex/asks/` (not a web page — it's the dev-only backend) — its own
  readme has the write side (`Asks.mark()`, the CLI, the stall rule). This folder only reads.
- Not to be confused with `public/framework/ai/council/asks.jsonl`, the council's older
  verdict log: same file name, unrelated.

## Use

Land your own task and want its ask marked? That's the Servex CLI, not this folder:

```
node Servex/asks/mark.mjs "asks ledger" landed "shipped, merged" --by your-agent-id
```

Reading the ledger from a page or from node always goes through `fold_asks` — see `fold.js`'s
own comment for the exact shape (`at`, `title`, `words`, `owner`, `card`, `status`, plus the
folded `status_at` and full `history`).

## Watch out

- **This page only reads.** Nothing here ever appends to `asks.jsonl` — that's `Servex/asks/`,
  append-only, so every status change is a new line, not a rewrite.
- **A stalled ask also shows up in AI 2's Needs you tab** (`ai2/needs.js`), ranked by
  `importance()` (`ai2/needs-rule.js`) alongside every open Decision and Question — one rule,
  shared, so the two lists can never disagree about what matters more.
- **A `words` path starting `.claude/`** (the owner's own dictated brief, not a served file)
  shows as plain text instead of a dead link — `words_url()` in both this page and
  `ai2/needs.js` make the same call.

## More

- `Servex/asks/readme.md` — the write side: `Asks.js`, the stall rule (`stalled.js`), the CLI,
  the test.
- [AI 2](/framework/ai2/) — its Needs you tab folds this same ledger in.
