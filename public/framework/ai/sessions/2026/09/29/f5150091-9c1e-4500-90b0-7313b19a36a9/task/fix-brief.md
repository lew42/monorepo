# Minion brief: fix round from the fresh review

Load the `minion` skill first, then `page`, `layout`, `css`, `content`, `code`. Worktree `C:\Code\lew42\worktrees\page-system-929` (server http://localhost:51061/). **Commit ONLY by exact path**, never `git add -A`/`commit -a`. For a `page.jsonl` file that the worktree server keeps appending to, stage with `git add <path>` right after your edit, check `git diff --cached <path>`, and commit it alone; or set the index with `git restore --source=<rev> --staged`. Never commit `public/framework/ai/**` or `board.jsonl`.

The review is `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\review-fresh.md`. Read section 2 in full. Fix findings 1, 2, 3, 5, 6, 7, 8, 9 and 10. Finding 4 (session ids) is already done.

Decisions already made. Don't reopen them.
- **Finding 1:** `jsonl` becomes a top tab on core/Page (the Doc `bar()` in `core/Page/page.js`), labelled "Storage (page.jsonl)", so the tab bar never disappears. Check that `/framework/core/Page/jsonl/` then shows the Page tab bar.
- **Finding 2:** a folder with a `page.js` keeps its weight lines in a separate **`weight.jsonl`** beside it, never a new `page.jsonl`. A `page.jsonl` file turns the folder into something the file watcher (PageFiles) writes to. Pages that are already `page.jsonl` pages keep their weight lines in that page.jsonl. Move the eight data-only `page.jsonl` files (layout/, navigation/, make/, ai/, dynamic/, generator/, overview/, old/) to `weight.jsonl` with the same weight lines only, and drop the watcher's `{"file": …}` lines. Delete the eight page.jsonl files. Update `weight.js`, `Server/page-refs.mjs` (for a page.js target, write weight.jsonl) and `weight/doc/design.md` (one line naming the rule and why). Also update `core/Page/jsonl/doc/writers.md` if it names where weight lines go.
- **Finding 5 and note 7:** these pages follow the layout page's model: tiles in the wide track as one even row or grid, text left-aligned, h3 inside cards, not h1.
- **Note 6:** the Overview's page object shows a short form (title, url, parent, children, files), with "all fields" one click down (a `<details>`). If `page_object()` can't do a short form, wrap it; don't edit `core/Page/object.js` (item-ui owns it).
- **Note 10:** keep one list in `core/Page/readme.md`, "The sub-systems", and fold the Index rows (generator, overview, old) into it as one line each.

## Proof

- Load `/framework/core/Page/`, `/ai/`, `/ai/agents/`, `/jsonl/`, `/weight/`, `/make/`, `/navigation/` and `/dynamic/` at 1920. For each, zero console errors and zero failed requests. Reach each one by clicking its tab.
- Re-shoot `ai-1920.png`, `jsonl-1920.png`, `weight-1920.png` and `page-1920.png` into `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\shots\`, then open and check each one.
- `git diff michael/dev HEAD --name-only` shows no `page.jsonl` under layout/, navigation/, make/, ai/, dynamic/, generator/, overview/ or old/.
- `node Server/page-refs.mjs` run twice on the same pair adds one line, not two. Paste the output.
- Every spawn sets `windowsHide: true`. Budget: about $4.

Reply with the hashes and a line per finding (fixed + proof), then stop.
