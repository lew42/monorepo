# Caveats — what actually goes wrong, and the fix for each

One line each. Every one of these was either measured or found while building this page.

1. **Appending is safe. Read-modify-write is not.** Measured on this machine, 2026-09-19:
   eight separate processes appending whole lines to one file, at every size tested (94
   bytes up to 64 KB, 150 MB total) — zero lines torn, zero lost. The same eight processes
   doing read-modify-write on one shared file lost 1,576 of 1,600 updates — 98.5% gone —
   and the file still parsed perfectly afterward, so nothing even looked broken. **The
   rule:** only ever append a line to a `page.jsonl`. Never read the whole file, change
   something, and write it back — that includes "just fixing one line by hand" in an
   editor. Full numbers:
   [`ai/2026-09-19/model-latency/task.jsonl`](/framework/ai/2026-09-19/model-latency/).

2. **Latest line wins, one key at a time — except the keys that accumulate.** Two lines that
   name the same `file`, or set the same `layout`, or call the same method — the second one
   wins completely; nothing before it is undone, it's just no longer the answer. **`place`
   and `referenced_by` are the exceptions:** every placement stays and draws, in the order it
   was appended, and every `referenced_by` line adds another linking page rather than
   replacing the last one — there's no way to "un-place" or "un-reference" something once
   it's on the page. If a page shouldn't show something, don't place it in the first place.

3. **Duplicate lines happen, and they're harmless.** This very page's own `page.jsonl` has
   two back-to-back `{"file":"child/"}` lines and two `{"file":"readme.md"}` lines, found
   while building this page. The cause: creating a folder AND a file inside it at the same
   moment fires two separate filesystem events — one for the folder, one for the file — and
   each one independently asks the watcher "what should the log say about this name?" If
   both land inside the same ~60 ms window, both read the log before either one's write
   lands, so both write the same line. **The fix is: nothing.** `set()` treats a repeated
   `file`/`gone` line as a no-op — writing the same value twice changes nothing on the page
   — so a duplicate is safe to ignore. It's just why a log can look longer than the story
   it tells.

4. **A live server's own lines can end up in someone else's commit.** The dev server
   appends a `file` line to any `page.jsonl` the instant a file changes anywhere in that
   folder — including changes from completely unrelated work happening in the same shared
   worktree. `git add -A` (or `git commit -a`) sweeps those lines in along with it. **The
   rule:** commit a `page.jsonl` by its exact path only, and check `git diff` names just the
   lines you meant before committing.

5. **`{"width": "wide"}` does nothing on a page with no `content()` of its own.** A
   `page.jsonl` page with no `page.js` renders through `log_view()`, and every box that
   method builds sits inside one fixed reading-width column — found while building this
   page, trying to give its own tile wall more room. **The rule:** a page.jsonl page is
   always reading-width; a page that genuinely needs more room needs a real `page.js` with
   its own `content()`, not a wider `page.jsonl` line.

6. **Size** — how big these files get, and the (not-yet-built) plan for the one that's a
   problem: [`doc/size.md`](/framework/core/Page/jsonl/md/doc/size/).
