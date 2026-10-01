Budget: $10

# quick-merge — `merge.mjs --quick`: smoke, ONE screenshot at the width that matters, merge, one JSON line

Read first: `../plan.md` (the hot path and your fence), `../requirements.md`, `../owner-words.md` — the owner's sentences about screenshots ("it doesn't make sense to take three extra screenshots when one would do … depends on the width of the content") are yours to make true.

## Fence
`Server/merge.mjs`, `Server/review.mjs`, `Server/layout-check.mjs` only if a one-width call needs a flag, `Server/doc/review.md` and the doc that describes merge (find it; `Server/README.md` one line), tests beside them (`*.test.mjs`), and your own task dir. Not `Servex/` (a sibling minion, fixer, owns it).

## Build
1. **`widthsFor(files, numstat, pages)` in `review.mjs`, exported**, one rule in one place: which of 400 / 1200 / 1920 / 3440 a change needs.
   - only `.md` or text in a `page.js`, no css → `[1200]`;
   - css or js that touches a layout word (`grid`, `columns`, `sidebar`, `flex`, `width`, `@container`, `@media`, a class from `framework/styles/layouts/`) or any file under `core/Page`, `core/Sidebar`, `styles/` → all four;
   - a change scoped to one component whose css has a `max-width` or lives under a mobile-only rule → `[400]` (if it works at 400 it works wider: the owner's words);
   - otherwise → `[400, 1920]`.
   Keep it under ~30 lines, plain `if`s, with a comment quoting the owner's one sentence. `review.mjs`'s own shots step uses it (replace the fixed four) — a `--widths` flag still overrides.
2. **`merge.mjs --quick`** (plus `--asked <iso>` passed through): allowed only when `sizeOf` is `none` or `light` AND ≤ 20 changed lines AND one module directory (`public/<a>/<b>/<c>/` or one `Server/` file); otherwise print `refused: --quick needs ≤20 lines in one module (this is N lines in M dirs, size S); run the normal path` and exit 2 — the fixer reads that and hands off. The quick path: lock, the existing smoke test on the changed page(s), ONE screenshot per width from `widthsFor` (for a quick fix that is normally one) via `layout-check.mjs` into `<taskdir or public/framework/ai/quick-fix/shots/<sha>/>`, then the merge exactly as today. No reviewer agent runs; the review gate's "needs a review newer than head" check is satisfied by `--quick` writing a `review.md` line `size quick — one shot at <w> — pass` the way `--size none` does today (one copy of that code, reused). The LAST stdout line is JSON: `{"merged":"<sha>","shot":"<path>","width":N,"ms":N,"asked_at":"…"}` (`ms` = now − `--asked` when given, else the merge's own wall time).
3. **Docs**: `Server/doc/review.md` gets a short "Which widths" section (the table above, the owner's sentence); the merge doc gets `--quick` in three lines. Draft the paragraph for the `review` skill ("pick widths by what changed") and put it on the card for the Servex mastermind to apply — don't edit `.claude/skills/`.

## Proof (on the card)
- `widthsFor` unit test: the four cases above, plus a mixed change → all four.
- `--quick` on a scratch worktree with a 3-line css change to one sandbox page: the one shot, the JSON line with `ms`; the same flag on a 40-line change → the refusal and exit 2.
- The normal `review.mjs` run on a `.md`-only change now takes one shot (1200), not four.

## How you work
- Load the `minion` skill first, then `code`. Read the readme chain for `Server/`.
- `take_worktree` from Servex; commit there by exact path. Review `--size light` (Server code, no page); answer every finding with an answer line in the main tree's `<taskdir>/task.jsonl` (`{"review":{"answer":{"n":N,"reply":"fixed: …"}}}` via append.mjs), then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree>`. Say "landed <sha>" on the card (no Servex restart needed for `Server/` scripts; the owner's :80 server supervisor is not restarted by these files any more).
- Every look is headless. Log only through `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`. Never the owner's name.
- Report on the card `2026/10/01/the-fast-path-fix-this-by-voice-is-live` (card_reply): two sentences at start, the proof when landed, or if blocked. Once landed: `return_worktree`, the last card line, end for good.
