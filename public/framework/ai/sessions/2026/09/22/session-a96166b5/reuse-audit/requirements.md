# reuse-audit — have we rewritten things instead of reusing them?

Minion: Opus, effort high, acting as a **sub-mastermind** — you spawn your own Sonnet minions.
Session id `a96166b5-d28c-4bbb-b6b4-b4b75ff668c2`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Private port: **8094**.

## The owner's words (2026-09-22 14:55)

> spawn a minion to look into a past request of mine to audit similar code/content/features
> across the public/imagine and framework (and anywhere else). it might be useful to spawn cheap
> sonnet minions per page, to read it, summarize what it is, see if there's a readme, update that
> readme if it's completely stale, and try to summarize sub-dir pages on parent readmes. and then
> the mastermind minion who is in charge of this can try to compare similar things across the
> framework/* and imagine/* and elsewhere.
>
> we're looking for reductions in functionality. drag and drop, resize handles, etc. ui cards,
> css minimization, etc. have we rewritten things instead of reusing them? most certainly.

## First: find the past request

The owner asked this before. Search `ai/board.jsonl`, `ai/2026-09-17/mastermind-layout-browser/asks.md`,
and `rg -l "similar|duplicate|reuse|rewritten" public/framework/ai/2026-09-1*/*/requirements.md`
for it; if a task already started on it, continue from its log instead of starting cold. Log
what you found in your first `log` line.

## The shape of the work

1. **Inventory (you, ~20 minutes, no minions).** The unit is a *module*: a directory under
   `public/framework/{core,ext,ui,ux,web,styles,dev}/` and `public/imagine/`, `public/layouts/`,
   `public/websites/` that has a `readme.md` or a `page.js`. List them with line counts (`.js`
   + `.css`), whether a `readme.md` exists and its mtime, into your log as a table. Skip
   generated pages (a dir whose `page.js` is under 30 lines and has no `.js` sibling is a leaf;
   count it, do not send a minion to it). Two numbers that must agree: modules in your table
   and dirs matched by your glob.
2. **Sonnet minions, one per cluster of 4–8 sibling modules**, at most **five at once**, at most
   **twenty in all** (say the expected cost in your log before the first wave: a Sonnet minion
   here costs about $0.30–0.80). Each minion's brief (write it into `ai/2026-09-22/reuse-audit/briefs/<n>.md`)
   names its modules and asks for: one paragraph per module — what it is, what it does, the
   features it implements from this list (drag and drop · resize handles · cards · panels ·
   tabs · popovers · editors · persistence/save · JSONL readers · layout/grid helpers · CSS
   utilities that restate `framework.css`) with the file:line of each — and a readme check: if
   `readme.md` is missing or stale (names files that no longer exist, describes a shape the code
   no longer has), rewrite it to the `documentation` skill's readme shape (what · Use · Watch out · More, as
   short as it can be — docs point, they don't explain), and add one line per sub-dir page to the parent readme. The minion returns its
   paragraphs as `log` lines in **your** task.jsonl (append-only, via `append.mjs`) tagged with
   its cluster number, and lands.
   Launch recipe (proven today): `claude --session-id <uuid> -p "You are a minion. Load the
   minion skill, then your brief at <path>." --model claude-sonnet-5 --effort medium
   --permission-mode acceptEdits --allowedTools "Bash,Read,Write,Edit,Glob,Grep"
   --output-format json > <scratchpad>/reuse-<n>.json`. Run each as a foreground Bash call with
   `timeout: 600000`, several per message for concurrency; record each minion's id in an
   `agent` line before it starts. Readme edits are live files: every minion takes the reload
   hold for its batch (`node Server/hold.mjs on "reuse-<n>"` … `off`).
3. **The comparison (you).** From the minions' paragraphs, build the duplicates table: one row
   per feature that exists in more than one place — where (module, file:line, lines), which
   one is the canonical/best, what the others would need to reuse it, callers of each, and the
   lines that go away. Rank by lines saved. Then: **a duplicate with three or fewer callers
   whose canonical twin is a drop-in gets reduced now** — by a Sonnet minion per reduction, one
   page at a time, proven headless before and after (the `ui-test` skill), behind the hold.
   Everything bigger is a **proposal** row with the exact plan (files, callers, the diff in
   words), because a change with a dozen callers is the owner's call (CLAUDE.md "Ask before").
4. **The page — `ai/2026-09-22/reuse-audit/page.js`.** Level 1: the headline number (lines of
   duplicated functionality found, lines removed today, lines proposed), the ranked table with
   links, and the readme refresh count (before/after: readmes missing, stale, fresh). One click
   down: the per-module paragraphs. Screenshot it at 1280 into `shots/`.

## Fence

Your task dir. Your minions: `readme.md` files anywhere under `public/` (and nothing else) for
step 2; for step 3 reductions, only the files the reduction names, one minion per page. No
`framework.css` edits by anyone in this task — a CSS reduction is a proposal row. Never two
minions in one file. Append-only to `.jsonl`.

## Length

The page: one screen above the fold. Landing report: ten sentences with the three headline
numbers. Stop spawning at twenty minions or $25, whichever first, and land what you have.
